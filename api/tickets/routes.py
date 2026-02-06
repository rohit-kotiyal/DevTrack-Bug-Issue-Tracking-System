from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from django.db.models import Max, Q
from api.core.dependencies import get_current_user
from api.tickets.schemas import TicketCreate, TicketResponse, TicketUpdate
from tickets.models import Ticket
from projects.models import ProjectMember


router = APIRouter(prefix="/tickets", tags=["Tickets"])

def require_ticket_write_access(ticket_id: int, user):
    ticket = Ticket.objects.select_related("project").get(id=ticket_id)

    membership = ProjectMember.objects.filter(
        project=ticket.project,
        user=user
    ).first()

    if not membership or membership.role not in ("ADMIN", "DEV"):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify this ticket"
        )

    return ticket


@router.post("/", response_model=TicketResponse)
def create_ticket(
    data: TicketCreate,
    current_user=Depends(get_current_user)
):
    membership = ProjectMember.objects.filter(
        user=current_user,
        project_id=data.project_id,
        role__in=("ADMIN", "DEV")
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tickets in this project."
        )

    # Validate assignee
    if data.assigned_to_id:
        assignee_membership = ProjectMember.objects.filter(
            user_id=data.assigned_to_id,
            project_id=data.project_id
        ).first()

        if not assignee_membership:
            raise HTTPException(400, "Assignee must be a project member.")

        if assignee_membership.role == "VIEWER":
            raise HTTPException(400, "Cannot assign tickets to VIEWER role members.")

    # KANBAN ORDER LOGIC
    if data.order is None:
        max_order = Ticket.objects.filter(
            project_id=data.project_id,
            status=data.status
        ).aggregate(max=Max("order"))["max"]
        order = (max_order or 0) + 1
    else:
        order = data.order

    ticket = Ticket.objects.create(
        title=data.title,
        description=data.description,
        issue_type=data.issue_type,
        status=data.status,
        priority=data.priority,
        project_id=data.project_id,
        created_by=current_user,
        assigned_to_id=data.assigned_to_id,
        order=order
    )

    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "issue_type": ticket.issue_type,
        "status": ticket.status,
        "priority": ticket.priority,
        "order": ticket.order,  # 🔥
        "project_id": ticket.project_id,
        "created_by_id": ticket.created_by_id,
        "assigned_to_id": ticket.assigned_to_id,
        "created_at": ticket.created_at,
        "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None
    }



@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    current_user=Depends(get_current_user)
):
    ticket = Ticket.objects.select_related("project", "assigned_to").get(id=ticket_id)

    if not ProjectMember.objects.filter(
        user=current_user,
        project=ticket.project
    ).exists():
        raise HTTPException(403, "Access denied")

    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "issue_type": ticket.issue_type,
        "status": ticket.status,
        "priority": ticket.priority,
        "project_id": ticket.project_id,
        "created_by_id": ticket.created_by_id,
        "assigned_to_id": ticket.assigned_to_id,
        "created_at": ticket.created_at,
        "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None
    }


@router.get("/project/{project_id}", response_model=List[TicketResponse])
def get_project_tickets(
    project_id: int,
    status_filter: str | None = None,
    issue_type: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    current_user=Depends(get_current_user)
):
    if not ProjectMember.objects.filter(
        user=current_user,
        project_id=project_id
    ).exists():
        raise HTTPException(403, "Access denied.")

    qs = (
        Ticket.objects
        .filter(project_id=project_id)
        .select_related("assigned_to")
        .order_by("status", "order")
    )

    if status_filter:
        qs = qs.filter(status=status_filter)

    if issue_type:
        qs = qs.filter(issue_type=issue_type)

    if priority:
        qs = qs.filter(priority=priority)

    if search:
        qs = qs.filter(
            Q(title__icontains=search) |  # ✅ FIXED: Double underscore
            Q(description__icontains=search)  # ✅ FIXED: Double underscore
        )

    tickets = []
    for ticket in qs:
        tickets.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "issue_type": ticket.issue_type,
            "status": ticket.status,
            "priority": ticket.priority,
            "order": ticket.order,
            "project_id": ticket.project_id,
            "created_by_id": ticket.created_by_id,
            "assigned_to_id": ticket.assigned_to_id,
            "created_at": ticket.created_at,
            "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None
        })

    return tickets



@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    current_user=Depends(get_current_user)
):
    ticket = Ticket.objects.select_related("project", "assigned_to").get(id=ticket_id)

    membership = ProjectMember.objects.filter(
        project=ticket.project,
        user=current_user
    ).first()

    if not membership:
        raise HTTPException(403, "Access denied")

    if membership.role in ("ADMIN", "DEV"):
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(ticket, field, value)

    elif ticket.assigned_to == current_user:
        if data.status is not None:
            ticket.status = data.status
        if data.order is not None:
            ticket.order = data.order
        else:
            raise HTTPException(403, "You can only update status/order")

    else:
        raise HTTPException(403, "Permission denied")

    ticket.save()

    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "issue_type": ticket.issue_type,
        "status": ticket.status,
        "priority": ticket.priority,
        "order": ticket.order,  # 🔥
        "project_id": ticket.project_id,
        "created_by_id": ticket.created_by_id,
        "assigned_to_id": ticket.assigned_to_id,
        "created_at": ticket.created_at,
        "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None
    }


@router.patch("/reorder")
def reorder_ticket(
    ticket_id: int,
    status: str,
    order: int,
    user=Depends(get_current_user),
):
    ticket = Ticket.objects.get(id=ticket_id)

    ticket.status = status
    ticket.order = order
    ticket.save()

    return {"success": True}


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(
    ticket_id: int,
    current_user=Depends(get_current_user)
):
    ticket = require_ticket_write_access(ticket_id, current_user)
    ticket.delete()
    return


@router.get("/", response_model=List[TicketResponse])
def get_all_tickets(current_user=Depends(get_current_user)):
    """
    Get all tickets across all projects that the user has access to
    """
    # Get all projects user is a member of
    user_projects = ProjectMember.objects.filter(
        user=current_user
    ).values_list('project_id', flat=True)
    
    # Get tickets from those projects
    tickets = Ticket.objects.filter(
        project_id__in=user_projects
    ).select_related('assigned_to').order_by('-created_at')
    
    result = []
    for ticket in tickets:
        result.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "issue_type": ticket.issue_type,
            "status": ticket.status,
            "priority": ticket.priority,
            "order": ticket.order,
            "project_id": ticket.project_id,
            "created_by_id": ticket.created_by_id,
            "assigned_to_id": ticket.assigned_to_id,
            "created_at": ticket.created_at,
            "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None
        })
    
    return result
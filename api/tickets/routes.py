from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
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

    # Validate assignee is project member AND not a VIEWER
    if data.assigned_to_id:
        assignee_membership = ProjectMember.objects.filter(
            user_id=data.assigned_to_id,
            project_id=data.project_id
        ).first()
        
        if not assignee_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignee must be a project member."
            )
        
        if assignee_membership.role == "VIEWER":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign tickets to VIEWER role members."
            )

    ticket = Ticket.objects.create(
        title=data.title,
        description=data.description,
        issue_type=data.issue_type,
        status=data.status,
        priority=data.priority,
        project_id=data.project_id,
        created_by=current_user,
        assigned_to_id=data.assigned_to_id
    )

    # Manually add assigned_to_email
    ticket_data = {
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
    
    return ticket_data


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
    current_user=Depends(get_current_user)
):
    if not ProjectMember.objects.filter(
        user=current_user,
        project_id=project_id
    ).exists():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )

    qs = Ticket.objects.filter(project_id=project_id).select_related('assigned_to')

    if status_filter:
        qs = qs.filter(status=status_filter)

    if issue_type:
        qs = qs.filter(issue_type=issue_type)

    # Convert to list with assigned_to_email
    tickets = []
    for ticket in qs:
        ticket_data = {
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
        tickets.append(ticket_data)
    
    return tickets


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    current_user=Depends(get_current_user)
):
    ticket = Ticket.objects.select_related('project', 'assigned_to').get(id=ticket_id)
    
    # Check membership
    membership = ProjectMember.objects.filter(
        project=ticket.project,
        user=current_user
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Allow ADMIN/DEV to update anything
    # Allow assigned user to update only status
    if membership.role in ("ADMIN", "DEV"):
        # Can update everything
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(ticket, field, value)
    elif ticket.assigned_to == current_user:
        # Can only update status
        if data.status:
            ticket.status = data.status
        else:
            raise HTTPException(
                status_code=403, 
                detail="You can only update the status of tickets assigned to you"
            )
    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify this ticket"
        )

    ticket.save()
    
    # Reload to get assigned_to relationship
    ticket = Ticket.objects.select_related('assigned_to').get(id=ticket_id)
    
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


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(
    ticket_id: int,
    current_user=Depends(get_current_user)
):
    ticket = require_ticket_write_access(ticket_id, current_user)
    ticket.delete()
    return
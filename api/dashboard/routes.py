from fastapi import APIRouter, Depends
from django.db.models import Count, Q
from api.core.dependencies import get_current_user
from projects.models import Project, ProjectMember
from tickets.models import Ticket

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(current_user=Depends(get_current_user)):
    """
    Get dashboard statistics for the current user
    Returns counts for projects and tickets across all user's projects
    """
    
    # Get all projects the user is a member of
    user_projects = ProjectMember.objects.filter(
        user=current_user
    ).values_list('project_id', flat=True)
    
    # Count total projects
    total_projects = len(user_projects)
    
    # Get all tickets in user's projects
    all_tickets = Ticket.objects.filter(project_id__in=user_projects)
    
    # Count tickets by status
    total_tickets = all_tickets.count()
    todo_tickets = all_tickets.filter(status="TODO").count()
    in_progress_tickets = all_tickets.filter(status="IN_PROGRESS").count()
    completed_tickets = all_tickets.filter(status="DONE").count()
    
    # Calculate percentage changes (mock data for now, you can implement actual tracking)
    # You could add a created_at field check to compare with previous period
    project_change = "+12%"  # Replace with actual calculation if needed
    ticket_change = "+8%"    # Replace with actual calculation if needed
    
    return {
        "total_projects": total_projects,
        "total_tickets": total_tickets,
        "todo_tickets": todo_tickets,
        "in_progress_tickets": in_progress_tickets,
        "completed_tickets": completed_tickets,
        "project_change": project_change,
        "ticket_change": ticket_change
    }


@router.get("/recent-activity")
def get_recent_activity(current_user=Depends(get_current_user)):
    """
    Get recent tickets/activity for the dashboard
    """
    user_projects = ProjectMember.objects.filter(
        user=current_user
    ).values_list('project_id', flat=True)
    
    recent_tickets = Ticket.objects.filter(
        project_id__in=user_projects
    ).select_related('project', 'assigned_to').order_by('-created_at')[:10]
    
    return [
        {
            "id": ticket.id,
            "title": ticket.title,
            "status": ticket.status,
            "priority": ticket.priority,
            "project_name": ticket.project.name,
            "assigned_to_email": ticket.assigned_to.email if ticket.assigned_to else None,
            "created_at": ticket.created_at
        }
        for ticket in recent_tickets
    ]
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from comments.models import Comments
from tickets.models import Ticket
from users.models import User
from projects.models import ProjectMember

from .schemas import CommentCreate, CommentResponse, CommentUpdate
from api.core.dependencies import get_current_user


router = APIRouter(prefix="/tickets", tags=["Comments"])


# --------------------
# Helper functions
# --------------------

def is_comment_author(comment: Comments, user: User) -> bool:
    return comment.user_id == user.id


def is_project_member(user: User, project_id: int) -> bool:
    return ProjectMember.objects.filter(
        user=user,
        project_id=project_id
    ).exists()


# --------------------
# Create Comment
# --------------------

@router.post(
    "/{ticket_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_comment(
    ticket_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        ticket = Ticket.objects.select_related("project").get(id=ticket_id)
    except Ticket.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found."
        )

    if not is_project_member(current_user, ticket.project_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project."
        )

    new_comment = Comments.objects.create(
        comment=data.comment,
        user=current_user,
        ticket=ticket
    )

    return {
        "id": new_comment.id,
        "comment": new_comment.comment,
        "user_id": new_comment.user_id,
        "ticket_id": new_comment.ticket_id,
        "created_at": new_comment.created_at,
        "username": new_comment.user.name,
        "user_email": new_comment.user.email
    }


# --------------------
# Get Comments
# --------------------

@router.get(
    "/{ticket_id}/comments",
    response_model=List[CommentResponse]
)
def get_comments(
    ticket_id: int,
    current_user: User = Depends(get_current_user)
):
    try:
        ticket = Ticket.objects.select_related("project").get(id=ticket_id)
    except Ticket.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found."
        )

    if not is_project_member(current_user, ticket.project_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project."
        )

    comments = (
        Comments.objects
        .select_related("user")
        .filter(ticket_id=ticket_id)
        .order_by("created_at")
    )

    return [
        {
            "id": comment.id,
            "comment": comment.comment,
            "user_id": comment.user_id,
            "ticket_id": comment.ticket_id,
            "created_at": comment.created_at,
            "username": comment.user.name,
            "user_email": comment.user.email
        }
        for comment in comments
    ]


# --------------------
# Update Comment
# --------------------

@router.put("/comments/{comment_id}")
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    current_user: User = Depends(get_current_user)
):
    comment = Comments.objects.select_related("user").filter(id=comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} does not exist."
        )

    if not is_comment_author(comment, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments."
        )

    comment.comment = payload.comment
    comment.save(update_fields=["comment"])

    return {
        "id": comment.id,
        "comment": comment.comment,
        "user_id": comment.user_id,
        "ticket_id": comment.ticket_id,
        "created_at": comment.created_at,
        "username": comment.user.name,
        "user_email": comment.user.email
    }


# --------------------
# Delete Comment
# --------------------

@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user)
):
    comment = Comments.objects.filter(id=comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found."
        )

    if not is_comment_author(comment, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments."
        )

    comment.delete()

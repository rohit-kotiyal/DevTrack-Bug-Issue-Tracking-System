from fastapi import APIRouter, Depends, HTTPException, status
from django.contrib.auth import get_user_model

from api.core.dependencies import get_current_user
from api.projects.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectMemberResponse,
    AddProjectMember,
)
from projects.models import Project, ProjectMember

User = get_user_model()

router = APIRouter(prefix="/projects", tags=["Projects"])


# -------------------------
# Permission helper
# -------------------------
def require_admin(project_id: int, user):
    member = ProjectMember.objects.filter(
        project_id=project_id,
        user=user
    ).first()

    if not member or member.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")

    return member


# -------------------------
# Create Project
# -------------------------
@router.post("/", response_model=ProjectResponse)
def create_project(data: ProjectCreate, current_user=Depends(get_current_user)):
    project = Project.objects.create(
        name=data.name,
        description=data.description or "",
        owner=current_user,
    )

    # creator becomes ADMIN
    ProjectMember.objects.create(
        user=current_user,
        project=project,
        role="ADMIN",
    )

    return project


@router.get("/{project_id}")
def get_project(project_id: int, current_user=Depends(get_current_user)):
    if not ProjectMember.objects.filter(
        user=current_user,
        project_id=project_id
    ).exists():
        raise HTTPException(403, "Access denied")

    project = Project.objects.get(id=project_id)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
    }


# -------------------------
# Add Project Member (EMAIL based)
# -------------------------
@router.post(
    "/{project_id}/member",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_project_member(
    project_id: int,
    data: AddProjectMember,
    current_user=Depends(get_current_user),
):
    # Admin check
    require_admin(project_id, current_user)

    try:
        user = User.objects.get(email=data.email)
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    if ProjectMember.objects.filter(
        project_id=project_id,
        user=user
    ).exists():
        raise HTTPException(
            status_code=400,
            detail="User already a project member",
        )

    member = ProjectMember.objects.create(
        project_id=project_id,
        user=user,
        role=data.role,
    )

    return member


# -------------------------
# List Project Members
# -------------------------
@router.get("/{project_id}/member")
def list_project_members(
    project_id: int,
    current_user=Depends(get_current_user)
):
    if not ProjectMember.objects.filter(
        user=current_user,
        project_id=project_id
    ).exists():
        raise HTTPException(status_code=403, detail="Access denied")

    members = ProjectMember.objects.select_related("user").filter(
        project_id=project_id
    )

    return [
        {
            "user_id": m.user.id,
            "email": m.user.email,
            "role": m.role,
        }
        for m in members
    ]



# -------------------------
# List My Projects
# -------------------------
@router.get("/")
def list_my_projects(current_user=Depends(get_current_user)):
    memberships = ProjectMember.objects.select_related("project").filter(
        user=current_user
    )

    return [
        {
            "project_id": m.project.id,
            "name": m.project.name,
            "role": m.role,
        }
        for m in memberships
    ]


# -------------------------
# Update Project
# -------------------------
@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    current_user=Depends(get_current_user),
):
    require_admin(project_id, current_user)

    project = Project.objects.filter(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    project.save()
    return project


# -------------------------
# Delete Project (Hard delete)
# -------------------------
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user=Depends(get_current_user),
):
    # Check if user is ADMIN of this project
    membership = ProjectMember.objects.filter(
        project_id=project_id,
        user=current_user
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if membership.role != "ADMIN":
        raise HTTPException(
            status_code=403, 
            detail="Only ADMIN can delete projects"
        )

    project = Project.objects.filter(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.delete()
    return

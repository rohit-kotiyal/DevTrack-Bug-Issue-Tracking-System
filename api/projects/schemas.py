from pydantic import BaseModel
from typing import Optional, Literal

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int

    class Config:
        from_attributes = True # Allows Pydantic to read Django ORM objects
        
class AddProjectMember(BaseModel):
    email: str
    role: Literal["ADMIN", "DEV", "VIEWER"]

class ProjectMemberResponse(BaseModel):
    user_id: int
    project_id: int
    role: str

    class Config:
        from_attributes = True
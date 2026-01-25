from pydantic import BaseModel, computed_field
from typing import Optional
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    issue_type: str = "TASK"      
    status: str = "TODO"
    priority: str = "MEDIUM"
    project_id: int
    assigned_to_id: Optional[int] = None


class TicketResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    issue_type: str               
    status: str
    priority: str
    project_id: int
    created_by_id: int
    assigned_to_id: Optional[int]
    created_at: datetime
    assigned_to_email: Optional[str] = None  # ← Add this field

    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    issue_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[int] = None
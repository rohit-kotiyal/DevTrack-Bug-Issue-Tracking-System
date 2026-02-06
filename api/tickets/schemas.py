from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    issue_type: str = "TASK"      
    status: Literal["TODO", "IN_PROGRESS", "DONE"] = "TODO"
    priority: str = "MEDIUM"
    project_id: int
    assigned_to_id: Optional[int] = None
    order: int | None = None

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
    order: int
    assigned_to_email: Optional[str] = None 

    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    issue_type: Optional[str] = None
    status: Literal["TODO", "IN_PROGRESS", "DONE"] = "TODO"
    priority: Optional[str] = None
    assigned_to_id: Optional[int] = None
    order: Optional[int] = None
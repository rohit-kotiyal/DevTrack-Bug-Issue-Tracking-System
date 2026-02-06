from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    comment: str
    ticket_id: int

class CommentResponse(BaseModel):
    id: int
    comment: str
    user_id: int
    ticket_id: int
    created_at: datetime
    username: Optional[str] = None
    user_email: Optional[str] = None

class CommentUpdate(BaseModel):
    comment: str = Field(..., min_length=1, max_length=5000)
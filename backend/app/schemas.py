from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    participants: str

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: int

    class Config:
        from_attributes = True

class EmailDraft(BaseModel):
    recipient: str
    suggested_time: str
    body: str

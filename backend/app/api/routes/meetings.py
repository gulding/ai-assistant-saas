from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.ai_secretary import parse_meeting_request, draft_meeting_reply

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.get("/", response_model=list[schemas.Meeting])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    meetings = db.query(models.Meeting).offset(skip).limit(limit).all()
    return meetings

@router.post("/parse", response_model=schemas.Meeting)
def parse_and_create_meeting(text: str = Body(..., embed=True), db: Session = Depends(get_db)):
    try:
        meeting_data = parse_meeting_request(text)
        db_meeting = models.Meeting(**meeting_data.dict())
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        return db_meeting
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/draft", response_model=schemas.EmailDraft)
def draft_reply(text: str = Body(..., embed=True)):
    try:
        return draft_meeting_reply(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

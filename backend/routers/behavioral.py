from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import BehavioralEntry
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user

router = APIRouter()

class EntryUpsert(BaseModel):
    question: str
    answer: Optional[str] = None
    is_custom: bool = False

class EntryUpdate(BaseModel):
    answer: Optional[str] = None
    question: Optional[str] = None

@router.get("/behavioral")
def get_entries(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return db.query(BehavioralEntry).filter(BehavioralEntry.user_id == user_id).all()

@router.post("/behavioral")
def create_entry(entry: EntryUpsert, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    db_entry = BehavioralEntry(user_id=user_id, **entry.dict())
    db.add(db_entry)
    try:
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Entry already exists")

@router.put("/behavioral/{entry_id}")
def update_entry(entry_id: int, update: EntryUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    entry = db.query(BehavioralEntry).filter(BehavioralEntry.id == entry_id, BehavioralEntry.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if update.answer is not None:
        entry.answer = update.answer
    if update.question is not None and entry.is_custom:
        entry.question = update.question
    try:
        db.commit()
        db.refresh(entry)
        return entry
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Question already exists")

@router.delete("/behavioral/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    entry = db.query(BehavioralEntry).filter(BehavioralEntry.id == entry_id, BehavioralEntry.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Problem
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class ProblemCreate(BaseModel):
    name: str
    pattern: Optional[str] = None
    difficulty: Optional[str] = None
    source: Optional[str] = None
    problem_link: Optional[str] = None
    solution_link: Optional[str] = None
    solution: Optional[str] = None
    explanation: Optional[str] = None
    date_solved: Optional[date] = None
    next_review: Optional[date] = None

@router.get("/problems")
def get_problems(db: Session = Depends(get_db)):
    return db.query(Problem).all()

@router.post("/problems")
def create_problem(problem: ProblemCreate, db: Session = Depends(get_db)):
    db_problem = Problem(**problem.dict())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem
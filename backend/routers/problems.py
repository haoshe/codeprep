from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import Problem
from pydantic import BaseModel
from datetime import date
from typing import Optional
from routers.sr_algo import calculate_next_review, initial_interval
from auth import get_current_user

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

class ProblemUpdate(BaseModel):
    difficulty: str

class ProblemEdit(BaseModel):
    name: Optional[str] = None
    pattern: Optional[str] = None
    difficulty: Optional[str] = None
    problem_link: Optional[str] = None
    solution_link: Optional[str] = None

@router.get("/problems")
def get_problems(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return db.query(Problem).filter(Problem.user_id == user_id).all()

@router.post("/problems")
def create_problem(problem: ProblemCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    db_problem = Problem(**problem.dict(), user_id=user_id)
    if problem.difficulty:
        interval = initial_interval(problem.difficulty)
        db_problem.last_interval = interval
        db_problem.next_review, _ = calculate_next_review(problem.difficulty, interval)
    db.add(db_problem)
    try:
        db.commit()
        db.refresh(db_problem)
        return db_problem
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem already exists")

@router.put("/problems/{problem_id}/review")
def update_review(problem_id: int, update: ProblemUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    problem = db.query(Problem).filter(Problem.id == problem_id, Problem.user_id == user_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    problem.difficulty = update.difficulty
    problem.next_review, problem.last_interval = calculate_next_review(update.difficulty, problem.last_interval or 1)
    db.commit()
    db.refresh(problem)
    return problem

@router.put("/problems/{problem_id}")
def edit_problem(problem_id: int, update: ProblemEdit, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    problem = db.query(Problem).filter(Problem.id == problem_id, Problem.user_id == user_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    for field, value in update.dict(exclude_unset=True).items():
        setattr(problem, field, value)
    try:
        db.commit()
        db.refresh(problem)
        return problem
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem already exists")

@router.delete("/problems/{problem_id}")
def delete_problem(problem_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    problem = db.query(Problem).filter(Problem.id == problem_id, Problem.user_id == user_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    db.delete(problem)
    db.commit()
    return {"message": "Problem deleted"}

@router.get("/problems/search")
def search_problems(q: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return db.query(Problem).filter(
        Problem.user_id == user_id,
    ).filter(
        Problem.name.ilike(f"%{q}%") |
        Problem.solution.ilike(f"%{q}%") |
        Problem.explanation.ilike(f"%{q}%") |
        Problem.pattern.ilike(f"%{q}%")
    ).all()

PRIORITY = {'Brand New': 0, 'Hard': 1}

@router.get("/problems/due")
def get_due_problems(limit: Optional[int] = None, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    today = date.today()
    problems = db.query(Problem).filter(Problem.user_id == user_id, Problem.next_review <= today).all()
    problems.sort(key=lambda p: (
        PRIORITY.get(p.difficulty, 2),
        p.next_review or today
    ))
    if limit:
        problems = problems[:limit]
    return problems

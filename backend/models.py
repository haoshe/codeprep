from sqlalchemy import Column, Integer, String, Text, Date, Boolean, UniqueConstraint
from database import Base
from datetime import date

class Problem(Base):
    __tablename__ = "problems"
    __table_args__ = (UniqueConstraint('name', 'user_id', name='uq_problem_name_user'),)

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(String(36), nullable=True, index=True)
    name            = Column(String(255), nullable=False)
    pattern         = Column(String(100))
    difficulty      = Column(String(20))
    source          = Column(String(20))
    problem_link    = Column(String(500), nullable=True)
    solution_link   = Column(String(500), nullable=True)
    solution        = Column(Text, nullable=True)
    explanation     = Column(Text, nullable=True)
    date_solved     = Column(Date, default=date.today)
    next_review     = Column(Date, nullable=True)
    last_interval   = Column(Integer, default=1)

class BehavioralEntry(Base):
    __tablename__ = "behavioral_entries"
    __table_args__ = (UniqueConstraint('user_id', 'question', name='uq_behavioral_user_question'),)

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(String(36), nullable=False, index=True)
    question   = Column(Text, nullable=False)
    answer     = Column(Text, nullable=True)
    is_custom  = Column(Boolean, default=False)
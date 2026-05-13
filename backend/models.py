from sqlalchemy import Column, Integer, String, Text, Date
from database import Base
from datetime import date

class Problem(Base):
    __tablename__ = "problems"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(255), nullable=False)
    pattern         = Column(String(100))
    difficulty      = Column(String(20))
    source          = Column(String(20))   # "leetcode" or "oa"
    problem_link    = Column(String(500), nullable=True)
    solution_link   = Column(String(500), nullable=True)
    solution        = Column(Text, nullable=True)
    explanation     = Column(Text, nullable=True)
    date_solved     = Column(Date, default=date.today)
    next_review     = Column(Date, nullable=True)
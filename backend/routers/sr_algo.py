from datetime import date, timedelta
import math

RESET_INTERVALS = {
    'Brand New': 1,
    'Hard': 2,
}

MULTIPLIERS = {
    'Medium': 1.5,
    'Easy': 2.5,
    'Mastered': 3.0,
}

INITIAL_INTERVALS = {
    'Brand New': 1,
    'Hard': 2,
    'Medium': 5,
    'Easy': 7,
    'Mastered': 14,
}

def calculate_next_review(difficulty: str, last_interval: int = 1) -> tuple:
    if difficulty in RESET_INTERVALS:
        new_interval = RESET_INTERVALS[difficulty]
    else:
        multiplier = MULTIPLIERS.get(difficulty, 1.0)
        new_interval = max(1, math.ceil(last_interval * multiplier))
    return date.today() + timedelta(days=new_interval), new_interval

def initial_interval(difficulty: str) -> int:
    return INITIAL_INTERVALS.get(difficulty, 1)

from datetime import date, timedelta
import math
import random

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

MAX_INTERVAL = 30

# Share of the days a review was late that counts toward the next interval
LATE_CREDIT = {
    'Medium': 0.5,
    'Easy': 1.0,
    'Mastered': 1.0,
}

def calculate_next_review(difficulty: str, last_interval: int = 1, days_late: int = 0) -> tuple:
    if difficulty in RESET_INTERVALS:
        new_interval = RESET_INTERVALS[difficulty]
    else:
        multiplier = MULTIPLIERS.get(difficulty, 1.0)
        base = last_interval + max(0, days_late) * LATE_CREDIT.get(difficulty, 0)
        new_interval = min(max(1, math.ceil(base * multiplier)), MAX_INTERVAL)
        if new_interval > 2:
            fuzz = random.uniform(-0.1, 0.1)
            new_interval = max(1, round(new_interval * (1 + fuzz)))
    return date.today() + timedelta(days=new_interval), new_interval

def initial_interval(difficulty: str) -> int:
    return INITIAL_INTERVALS.get(difficulty, 1)

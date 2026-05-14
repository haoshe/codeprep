from datetime import date, timedelta

INTERVALS = {
    "Hard": 2,
    "Medium": 5,
    "Easy": 7,
    "Mastered": 14
}

def calculate_next_review(difficulty: str) -> date:
    days = INTERVALS.get(difficulty, 2)
    return date.today() + timedelta(days=days)
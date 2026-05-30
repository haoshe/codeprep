CREATE TABLE IF NOT EXISTS behavioral_entries (
    id         SERIAL PRIMARY KEY,
    user_id    TEXT NOT NULL,
    question   TEXT NOT NULL,
    answer     TEXT,
    is_custom  BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_behavioral_user_question UNIQUE (user_id, question)
);

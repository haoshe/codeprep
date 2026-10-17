-- Track the day each problem was last reviewed, so the daily review cap is shared across devices
ALTER TABLE problems ADD COLUMN IF NOT EXISTS last_reviewed DATE;

-- Step 1: add user_id column (nullable for now)
ALTER TABLE problems ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 2: drop old unique constraint on name alone
ALTER TABLE problems DROP CONSTRAINT IF EXISTS uq_problem_name;

-- Step 3: add new unique constraint on (name, user_id) pair
ALTER TABLE problems ADD CONSTRAINT uq_problem_name_user UNIQUE (name, user_id);

-- Step 4: backfill existing problems with your Supabase user UUID
-- Replace the UUID below with your own (find it in Supabase → Authentication → Users)
UPDATE problems SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;

-- STEP-BY-STEP SUPABASE SETUP
-- Run these commands one by one in your Supabase SQL Editor

-- Step 1: Create the table
CREATE TABLE work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    original_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes (run separately)
CREATE INDEX idx_work_history_timestamp ON work_history(timestamp DESC);

-- Step 3: Enable RLS (run separately)
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy (run separately)
CREATE POLICY "Allow all operations" ON work_history
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Step 5: Grant permissions (run separately)
GRANT ALL ON work_history TO anon;
GRANT ALL ON work_history TO authenticated;

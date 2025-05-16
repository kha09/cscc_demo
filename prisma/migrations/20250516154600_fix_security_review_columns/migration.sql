-- Safely rename taskId to systemId if present, update related constraints and index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'SecurityReview' AND column_name = 'taskId'
  ) THEN
    ALTER TABLE "SecurityReview" RENAME COLUMN "taskId" TO "systemId";
    ALTER TABLE "SecurityReview" DROP CONSTRAINT IF EXISTS "SecurityReview_taskId_fkey";
    DROP INDEX IF EXISTS "SecurityReview_taskId_idx";
    ALTER TABLE "SecurityReview" ADD CONSTRAINT "SecurityReview_systemId_fkey"
      FOREIGN KEY ("systemId") REFERENCES "SensitiveSystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    CREATE INDEX IF NOT EXISTS "SecurityReview_systemId_idx" ON "SecurityReview"("systemId");
  END IF;
END
$$;

-- Add departmentManagerId column if it doesn't exist
ALTER TABLE "SecurityReview"
  ADD COLUMN IF NOT EXISTS "departmentManagerId" TEXT;

-- Safely add foreign key for departmentManagerId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'SecurityReview'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'departmentManagerId'
  ) THEN
    ALTER TABLE "SecurityReview" ADD CONSTRAINT "SecurityReview_departmentManagerId_fkey"
      FOREIGN KEY ("departmentManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- Create index for departmentManagerId if missing
CREATE INDEX IF NOT EXISTS "SecurityReview_departmentManagerId_idx"
  ON "SecurityReview"("departmentManagerId");

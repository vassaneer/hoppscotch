-- Add username and passwordHash to User for local auth (idempotent)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Add unique index on username if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Create PasswordSetupToken table if not exists
CREATE TABLE IF NOT EXISTS "PasswordSetupToken" (
    "token" TEXT NOT NULL,
    "userUid" TEXT NOT NULL,
    "expiresOn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PasswordSetupToken_pkey" PRIMARY KEY ("token")
);

-- Unique index on token if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordSetupToken_token_key" ON "PasswordSetupToken"("token");

-- Add foreign key only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PasswordSetupToken_userUid_fkey'
  ) THEN
    ALTER TABLE "PasswordSetupToken" ADD CONSTRAINT "PasswordSetupToken_userUid_fkey"
      FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Enable LOCAL auth provider if not already enabled
UPDATE "InfraConfig"
SET value = value || ',LOCAL'
WHERE name = 'VITE_ALLOWED_AUTH_PROVIDERS'
  AND value NOT LIKE '%LOCAL%';

-- Additive migration: no records are deleted.
BEGIN;
ALTER TABLE category_weights ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT FALSE;
COMMIT;

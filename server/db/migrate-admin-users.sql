-- Migration for existing production databases.
-- Run once in Neon SQL Editor.

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'superadmin',
  ADD COLUMN IF NOT EXISTS enclosure_id VARCHAR(100);

UPDATE admin_users
SET display_name = username
WHERE display_name = '';

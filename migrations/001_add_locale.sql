-- Migration: Add locale column to all tables
-- Run this in Supabase SQL Editor

-- Add locale to testers table
ALTER TABLE testers ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'et';

-- Add locale to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'et';

-- Add locale to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'et';

-- Add index for locale queries
CREATE INDEX IF NOT EXISTS idx_testers_locale ON testers(locale);
CREATE INDEX IF NOT EXISTS idx_feedback_locale ON feedback(locale);
CREATE INDEX IF NOT EXISTS idx_orders_locale ON orders(locale);

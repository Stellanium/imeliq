-- imeliq.com Supabase andmebaasi skeem
-- Käivita see Supabase SQL Editor-is

-- Katsetajad (testers)
CREATE TABLE IF NOT EXISTS testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  family_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tagasiside (feedback)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID REFERENCES testers(id),
  product_code VARCHAR(50) NOT NULL,
  referrer_name VARCHAR(100) NOT NULL,
  feeling VARCHAR(20) NOT NULL CHECK (feeling IN ('nothing', 'energy', 'other')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tellimused (orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID REFERENCES testers(id),
  email VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10,2) NOT NULL,
  pickup_location VARCHAR(20) NOT NULL CHECK (pickup_location IN ('courier', 'tallinn', 'parnu', 'tartu', 'vantaa')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indeksid kiirema otsingu jaoks
CREATE INDEX IF NOT EXISTS idx_testers_email ON testers(email);
CREATE INDEX IF NOT EXISTS idx_feedback_feeling ON feedback(feeling);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- RLS (Row Level Security) - luba anonüümne insert
ALTER TABLE testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: anonüümne insert lubatud
CREATE POLICY "Allow anonymous insert" ON testers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON orders FOR INSERT WITH CHECK (true);

-- Policy: ainult autenditud kasutajad saavad lugeda (admin jaoks)
CREATE POLICY "Allow authenticated read" ON testers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read" ON feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Statistika view
CREATE OR REPLACE VIEW feedback_stats AS
SELECT
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN feeling = 'energy' THEN 1 END) as positive_count,
  COUNT(CASE WHEN feeling = 'nothing' THEN 1 END) as negative_count,
  COUNT(CASE WHEN feeling = 'other' THEN 1 END) as neutral_count,
  ROUND(100.0 * COUNT(CASE WHEN feeling = 'energy' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as positive_percent,
  ROUND(100.0 * COUNT(CASE WHEN feeling = 'nothing' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as negative_percent
FROM feedback;

-- TOP soovitajad view
CREATE OR REPLACE VIEW top_referrers AS
SELECT
  referrer_name,
  COUNT(*) as referral_count,
  COUNT(CASE WHEN feeling = 'energy' THEN 1 END) as positive_referrals
FROM feedback
GROUP BY referrer_name
ORDER BY referral_count DESC
LIMIT 10;

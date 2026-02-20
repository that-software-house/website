-- LeadFlow AI: leads table for storing extracted lead data
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  channel TEXT CHECK (channel IN ('email', 'dm', 'form')),
  intent TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  deal_size INTEGER,
  suggested_action TEXT,
  summary TEXT,
  raw_text TEXT,
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'won')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see/edit their own leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leads"
  ON leads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_stage ON leads(user_id, stage);

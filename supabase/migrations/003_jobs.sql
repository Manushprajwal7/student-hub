-- Drop existing table if it exists
DROP TABLE IF EXISTS public.jobs;

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  application_link TEXT NOT NULL,
  type TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (type IN ('Full Time', 'Part Time', 'Internship')),
  CONSTRAINT valid_currency CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'KRW'))
);

-- Create indexes
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_type ON public.jobs(type);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own job posts"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job posts"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job posts"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);


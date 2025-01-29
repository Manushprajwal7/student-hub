-- Drop existing table if it exists
DROP TABLE IF EXISTS public.scholarships;

-- Create scholarships table
CREATE TABLE public.scholarships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  provider TEXT NOT NULL,
  application_link TEXT NOT NULL,
  reports UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (
    category IN (
      'Male',
      'Female',
      'State Level',
      'National Level'
    )
  ),
  CONSTRAINT scholarships_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_scholarships_user_id ON public.scholarships(user_id);
CREATE INDEX idx_scholarships_category ON public.scholarships(category);
CREATE INDEX idx_scholarships_deadline ON public.scholarships(deadline);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Scholarships are viewable by everyone"
  ON public.scholarships FOR SELECT
  USING (true);

CREATE POLICY "Users can create scholarships"
  ON public.scholarships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scholarships"
  ON public.scholarships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scholarships"
  ON public.scholarships FOR DELETE
  USING (auth.uid() = user_id);


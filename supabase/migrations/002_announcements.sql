-- Drop existing table if it exists
DROP TABLE IF EXISTS public.announcements;

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_priority CHECK (priority IN ('High', 'Medium', 'Low'))
);

-- Create indexes
CREATE INDEX idx_announcements_user_id ON public.announcements(user_id);
CREATE INDEX idx_announcements_priority ON public.announcements(priority);
CREATE INDEX idx_announcements_date ON public.announcements(date);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Announcements are viewable by everyone"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcements"
  ON public.announcements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcements"
  ON public.announcements FOR DELETE
  USING (auth.uid() = user_id);


-- Drop existing table if it exists
DROP TABLE IF EXISTS public.study_groups;

-- Create study_groups table
CREATE TABLE public.study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  day TEXT NOT NULL,
  location TEXT NOT NULL,
  whatsapp_link TEXT NOT NULL,
  members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_subject CHECK (subject IN ('Computer Science', 'Electronics', 'Bio Technology', 'Mechanical', 'Mechanotronics', 'Civil'))
);

-- Create indexes
CREATE INDEX idx_study_groups_user_id ON public.study_groups(user_id);
CREATE INDEX idx_study_groups_subject ON public.study_groups(subject);
CREATE INDEX idx_study_groups_created_at ON public.study_groups(created_at);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Study groups are viewable by everyone"
ON public.study_groups FOR SELECT
USING (true);

CREATE POLICY "Users can create their own study groups"
ON public.study_groups FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study groups"
ON public.study_groups FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study groups"
ON public.study_groups FOR DELETE
USING (auth.uid() = user_id);


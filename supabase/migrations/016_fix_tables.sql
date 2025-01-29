-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS public.issues CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.study_groups CASCADE;
DROP TABLE IF EXISTS public.scholarships CASCADE;

-- Create issues table
CREATE TABLE public.issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  upvotes UUID[] DEFAULT ARRAY[]::UUID[],
  downvotes UUID[] DEFAULT ARRAY[]::UUID[],
  reports UUID[] DEFAULT ARRAY[]::UUID[],
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (
    category IN (
      'Teaching',
      'Women Rights',
      'Ragging',
      'Cultural Events',
      'Campus',
      'Sports',
      'Fest',
      'Infrastructure',
      'Academics',
      'Student Services',
      'Extracurricular Activities'
    )
  )
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  registration_link TEXT NOT NULL,
  type TEXT NOT NULL,
  registrations UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (
    type IN (
      'Cultural Event',
      'Technical',
      'Out Reach Activity',
      'Rally Event',
      'Awareness Event'
    )
  )
);

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

-- Create resources table
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_department CHECK (
    department IN ('CSE', 'ISE', 'AIML', 'BT', 'EEE', 'ECE', 'MT', 'ME')
  ),
  CONSTRAINT valid_semester CHECK (
    semester IN ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')
  ),
  CONSTRAINT valid_type CHECK (
    type IN ('Notes', 'Textbooks', 'Practice Tests', 'Study Guides')
  )
);

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
  CONSTRAINT valid_type CHECK (
    type IN ('Full Time', 'Part Time', 'Internship')
  ),
  CONSTRAINT valid_currency CHECK (
    currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'KRW')
  )
);

-- Create study groups table
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
  CONSTRAINT valid_subject CHECK (
    subject IN (
      'Computer Science',
      'Electronics',
      'Bio Technology',
      'Mechanical',
      'Mechanotronics',
      'Civil'
    )
  )
);

-- Create scholarships table
CREATE TABLE public.scholarships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline DATE NOT NULL,
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  application_link TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  reports UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (
    category IN ('Male', 'Female', 'State Level', 'National Level')
  )
);

-- Create indexes
CREATE INDEX idx_issues_user_id ON public.issues(user_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_announcements_user_id ON public.announcements(user_id);
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_study_groups_user_id ON public.study_groups(user_id);
CREATE INDEX idx_scholarships_user_id ON public.scholarships(user_id);

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access"
  ON public.issues FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own content"
  ON public.issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON public.issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON public.issues FOR DELETE
  USING (auth.uid() = user_id);

-- Repeat similar policies for other tables
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY['events', 'announcements', 'resources', 'jobs', 'study_groups', 'scholarships'])
  LOOP
    EXECUTE format('
      CREATE POLICY "Public read access" ON public.%I FOR SELECT USING (true);
      CREATE POLICY "Users can create their own content" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own content" ON public.%I FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete their own content" ON public.%I FOR DELETE USING (auth.uid() = user_id);
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;


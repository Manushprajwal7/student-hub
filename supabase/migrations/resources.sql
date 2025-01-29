-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.resources;
DROP TABLE IF EXISTS public.profiles;

-- Create the profiles table first
CREATE TABLE public.profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone,
    UNIQUE(user_id)
);

-- Create the resources table with reference to auth.users
CREATE TABLE public.resources (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    department text NOT NULL,
    semester text NOT NULL,
    type text NOT NULL,
    tags text[] DEFAULT '{}',
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_department CHECK (department IN ('CSE', 'ISE', 'AIML', 'BT', 'EEE', 'ECE', 'MT', 'ME')),
    CONSTRAINT valid_semester CHECK (semester IN ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')),
    CONSTRAINT valid_type CHECK (type IN ('Notes', 'Textbooks', 'Practice Tests', 'Study Guides'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for resources
CREATE POLICY "Resources are viewable by everyone"
    ON resources FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own resources"
    ON resources FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS resources_user_id_idx ON resources(user_id);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- Create a function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


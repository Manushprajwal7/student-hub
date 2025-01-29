-- Add resolved and reported columns to issues table
ALTER TABLE public.issues
ADD COLUMN resolved BOOLEAN DEFAULT false,
ADD COLUMN resolved_at TIMESTAMPTZ,
ADD COLUMN resolved_by UUID REFERENCES auth.users(id);

-- Create index for resolved status
CREATE INDEX idx_issues_resolved ON public.issues(resolved);


-- Add missing RLS policies for delete operations
CREATE POLICY "Users can delete their own issues"
ON public.issues FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
ON public.resources FOR DELETE
USING (auth.uid() = user_id);

-- Add cascade delete for related data in issues
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_issue_id_fkey,
ADD CONSTRAINT comments_issue_id_fkey 
  FOREIGN KEY (issue_id) 
  REFERENCES public.issues(id) 
  ON DELETE CASCADE;

-- Add cascade delete for related data in resources
ALTER TABLE public.resources
DROP CONSTRAINT IF EXISTS resources_user_id_fkey,
ADD CONSTRAINT resources_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.resources(user_id);


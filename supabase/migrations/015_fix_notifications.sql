-- Drop and recreate notifications table with improved schema
DROP TABLE IF EXISTS public.notifications;

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  related_id UUID,
  related_type TEXT,
  action_url TEXT,
  CONSTRAINT valid_type CHECK (
    type IN (
      'issue',
      'event',
      'announcement',
      'resource',
      'job',
      'study_group',
      'scholarship',
      'system'
    )
  )
);

-- Add better indexes for performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create notification functions
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    content,
    type,
    related_id,
    related_type,
    action_url
  ) VALUES (
    p_user_id,
    p_title,
    p_content,
    p_type,
    p_related_id,
    p_related_type,
    p_action_url
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for various events
CREATE OR REPLACE FUNCTION notify_on_content_creation() RETURNS TRIGGER AS $$
BEGIN
  -- Get the type of content from TG_TABLE_NAME
  PERFORM create_notification(
    NEW.user_id,
    CASE TG_TABLE_NAME
      WHEN 'issues' THEN 'New Issue Created'
      WHEN 'events' THEN 'New Event Created'
      WHEN 'announcements' THEN 'New Announcement'
      WHEN 'resources' THEN 'New Resource Shared'
      WHEN 'jobs' THEN 'New Job Posted'
      WHEN 'study_groups' THEN 'New Study Group'
      WHEN 'scholarships' THEN 'New Scholarship'
    END,
    CASE TG_TABLE_NAME
      WHEN 'issues' THEN 'A new issue has been created: ' || NEW.title
      WHEN 'events' THEN 'A new event has been created: ' || NEW.title
      WHEN 'announcements' THEN 'New announcement: ' || NEW.title
      WHEN 'resources' THEN 'A new resource has been shared: ' || NEW.title
      WHEN 'jobs' THEN 'A new job has been posted: ' || NEW.title
      WHEN 'study_groups' THEN 'A new study group has been created: ' || NEW.name
      WHEN 'scholarships' THEN 'A new scholarship is available: ' || NEW.title
    END,
    TG_TABLE_NAME,
    NEW.id,
    TG_TABLE_NAME,
    '/' || TG_TABLE_NAME || '/' || NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for each content type
CREATE TRIGGER notify_new_issue
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_event
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_announcement
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_resource
  AFTER INSERT ON resources
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_job
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_study_group
  AFTER INSERT ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();

CREATE TRIGGER notify_new_scholarship
  AFTER INSERT ON scholarships
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_content_creation();


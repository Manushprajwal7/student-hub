create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  constraint profiles_user_id_key unique (user_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = user_id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = user_id );

-- Create a storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.uid() = owner );


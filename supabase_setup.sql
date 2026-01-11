-- Create a function to look up the author name
create or replace function public.handle_new_post_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_name text;
begin
  -- Get the username from auth.users metadata, or fall back to email part
  select 
    coalesce(
      raw_user_meta_data->>'username',
      split_part(email, '@', 1),
      'Anonymous'
    ) into user_name
  from auth.users
  where id = new.user_id;

  -- Set the author_name on the new record
  new.author_name := user_name;
  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created_post on public.posts;
create trigger on_auth_user_created_post
  before insert on public.posts
  for each row execute procedure public.handle_new_post_author();

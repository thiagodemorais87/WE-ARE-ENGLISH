-- Allow authenticated admins to replace the system activity catalog safely.
-- Used by: npm run catalog:sync (RPC admin_replace_system_catalog)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.admin_replace_system_catalog(
  p_listening jsonb,
  p_others jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  keep_titles text[];
  updated_count int := 0;
  inserted_count int := 0;
  deleted_count int := 0;
  listen_row public.activities%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if jsonb_typeof(p_listening) is distinct from 'array'
     or jsonb_typeof(p_others) is distinct from 'array' then
    raise exception 'p_listening and p_others must be JSON arrays';
  end if;

  select coalesce(array_agg(x.title), '{}')
  into keep_titles
  from (
    select distinct jsonb_extract_path_text(value, 'title') as title
    from jsonb_array_elements(p_listening)
  ) x
  where x.title is not null and x.title <> '';

  for item in select value from jsonb_array_elements(p_listening)
  loop
    update public.activities a
    set
      description = coalesce(item->>'description', a.description),
      level = coalesce(item->>'level', a.level),
      difficulty = coalesce(item->>'difficulty', a.difficulty),
      instructions = coalesce(item->>'instructions', a.instructions),
      content = coalesce(item->'content', a.content),
      audio_url = coalesce(nullif(item->>'audio_url', ''), a.audio_url),
      image_url = coalesce(nullif(item->>'image_url', ''), a.image_url),
      duration = coalesce((item->>'duration')::int, a.duration),
      points = coalesce((item->>'points')::int, a.points),
      is_published = true,
      is_system = true
    where a.is_system = true
      and a.type = 'listening'
      and a.title = item->>'title'
    returning * into listen_row;

    if listen_row.id is null then
      insert into public.activities (
        title, description, type, level, difficulty, instructions, content,
        audio_url, image_url, duration, points, is_published, is_system, created_by
      ) values (
        item->>'title',
        coalesce(item->>'description', ''),
        'listening',
        coalesce(item->>'level', 'A2'),
        coalesce(item->>'difficulty', 'easy'),
        coalesce(item->>'instructions', ''),
        coalesce(item->'content', '{}'::jsonb),
        nullif(item->>'audio_url', ''),
        nullif(item->>'image_url', ''),
        coalesce((item->>'duration')::int, 10),
        coalesce((item->>'points')::int, 10),
        true,
        true,
        null
      );
      inserted_count := inserted_count + 1;
    else
      updated_count := updated_count + 1;
    end if;
  end loop;

  delete from public.activities a
  where a.is_system = true
    and not (
      a.type = 'listening'
      and a.title = any (keep_titles)
    );
  get diagnostics deleted_count = row_count;

  for item in select value from jsonb_array_elements(p_others)
  loop
    insert into public.activities (
      title, description, type, level, difficulty, instructions, content,
      audio_url, image_url, duration, points, is_published, is_system, created_by
    ) values (
      item->>'title',
      coalesce(item->>'description', ''),
      item->>'type',
      coalesce(item->>'level', 'A2'),
      coalesce(item->>'difficulty', 'easy'),
      coalesce(item->>'instructions', ''),
      coalesce(item->'content', '{}'::jsonb),
      null,
      nullif(item->>'image_url', ''),
      coalesce((item->>'duration')::int, 10),
      coalesce((item->>'points')::int, 10),
      true,
      true,
      null
    );
    inserted_count := inserted_count + 1;
  end loop;

  return jsonb_build_object(
    'updated_listening', updated_count,
    'inserted', inserted_count,
    'deleted', deleted_count,
    'keep_listening_titles', to_jsonb(keep_titles)
  );
end;
$$;

revoke all on function public.admin_replace_system_catalog(jsonb, jsonb) from public;
grant execute on function public.admin_replace_system_catalog(jsonb, jsonb) to authenticated, service_role;

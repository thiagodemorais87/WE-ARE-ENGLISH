-- Keep only admin@weareenglish.com.br. Run in Supabase SQL Editor.
-- Create the user first in Authentication → Users if it does not exist yet.

delete from auth.users
where email is distinct from 'admin@weareenglish.com.br';

update public.profiles
set role = 'admin',
    full_name = coalesce(nullif(full_name, ''), 'Admin')
where id = (select id from auth.users where email = 'admin@weareenglish.com.br');

select u.id, u.email, p.full_name, p.role
from auth.users u
left join public.profiles p on p.id = u.id;

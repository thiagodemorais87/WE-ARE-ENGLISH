-- Allow legacy media catalog types used by system seeds (YouTube embeds + games).
-- Previous CHECK rejected music/video/game and could abort the whole seed INSERT
-- after DELETE of is_system rows — leaving Listening (and other skills) missing in DB.

alter table public.activities drop constraint if exists activities_type_check;

alter table public.activities
  add constraint activities_type_check check (type in (
    'listening', 'speaking', 'pronunciation', 'writing', 'reading',
    'multiple_choice', 'fill_blank', 'word_order', 'matching', 'true_false',
    'vocabulary', 'grammar',
    'music', 'video', 'game'
  ));

-- Complete RLS fix for GitRoaster voting
-- This disables RLS temporarily to fix 406 errors

-- Disable RLS on all tables (temporary fix)
ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_roasts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public votes are viewable by everyone" ON public.votes;
DROP POLICY IF EXISTS "Anyone can vote" ON public.votes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.votes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.votes;

DROP POLICY IF EXISTS "Public roasts are viewable by everyone" ON public.roasts;
DROP POLICY IF EXISTS "Anyone can insert roasts" ON public.roasts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.roasts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.roasts;
DROP POLICY IF EXISTS "Enable update for vote counts" ON public.roasts;

DROP POLICY IF EXISTS "Public daily roasts are viewable by everyone" ON public.daily_roasts;

-- Note: You can re-enable RLS later and recreate policies if needed
-- For now, this ensures voting works without permission issues

-- GitRoaster v2.0 Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roasts table for storing all roasts
CREATE TABLE public.roasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    roast_text TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    roast_type TEXT DEFAULT 'profile' CHECK (roast_type IN ('profile', 'repo')),
    repo_name TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fingerprint TEXT NOT NULL,
    
    -- Indexes for performance
    CONSTRAINT roasts_username_check CHECK (char_length(username) <= 100),
    CONSTRAINT roasts_roast_text_check CHECK (char_length(roast_text) <= 2000),
    CONSTRAINT roasts_repo_name_check CHECK (repo_name IS NULL OR char_length(repo_name) <= 100)
);

-- Daily roasts table for "Roast of the Day" feature
CREATE TABLE public.daily_roasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roast_id UUID NOT NULL REFERENCES public.roasts(id) ON DELETE CASCADE,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table for tracking anonymous votes
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roast_id UUID NOT NULL REFERENCES public.roasts(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per fingerprint per roast
    UNIQUE(roast_id, fingerprint)
);

-- Indexes for better performance
CREATE INDEX idx_roasts_votes ON public.roasts(votes DESC);
CREATE INDEX idx_roasts_created_at ON public.roasts(created_at DESC);
CREATE INDEX idx_roasts_type ON public.roasts(roast_type);
CREATE INDEX idx_roasts_username ON public.roasts(username);
CREATE INDEX idx_votes_roast_id ON public.votes(roast_id);
CREATE INDEX idx_votes_fingerprint ON public.votes(fingerprint);
CREATE INDEX idx_daily_roasts_date ON public.daily_roasts(date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.roasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_roasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to roasts
CREATE POLICY "Public roasts are viewable by everyone" 
ON public.roasts FOR SELECT 
USING (true);

-- Allow public insert of new roasts
CREATE POLICY "Anyone can insert roasts" 
ON public.roasts FOR INSERT 
WITH CHECK (true);

-- Allow public read access to daily roasts
CREATE POLICY "Public daily roasts are viewable by everyone" 
ON public.daily_roasts FOR SELECT 
USING (true);

-- Allow public read access to votes for counting
CREATE POLICY "Public votes are viewable by everyone" 
ON public.votes FOR SELECT 
USING (true);

-- Allow public insert of votes
CREATE POLICY "Anyone can vote" 
ON public.votes FOR INSERT 
WITH CHECK (true);

-- Function to update vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_roast_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.roasts 
        SET votes = votes + 1 
        WHERE id = NEW.roast_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.roasts 
        SET votes = votes - 1 
        WHERE id = OLD.roast_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
CREATE TRIGGER update_roast_votes
    AFTER INSERT OR DELETE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_roast_vote_count();

-- Function to get roast of the day (called by cron or manually)
CREATE OR REPLACE FUNCTION select_roast_of_the_day(target_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
    selected_roast_id UUID;
BEGIN
    -- Check if we already have a roast of the day for this date
    SELECT roast_id INTO selected_roast_id
    FROM public.daily_roasts
    WHERE date = target_date;
    
    -- If not found, select the highest voted roast from the previous day
    IF selected_roast_id IS NULL THEN
        SELECT id INTO selected_roast_id
        FROM public.roasts
        WHERE DATE(created_at) = target_date - INTERVAL '1 day'
        ORDER BY votes DESC, created_at ASC
        LIMIT 1;
        
        -- If we found a roast, insert it as roast of the day
        IF selected_roast_id IS NOT NULL THEN
            INSERT INTO public.daily_roasts (roast_id, date)
            VALUES (selected_roast_id, target_date)
            ON CONFLICT (date) DO NOTHING;
        END IF;
    END IF;
    
    RETURN selected_roast_id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy querying of roasts with vote counts
CREATE VIEW public.roasts_with_details AS
SELECT 
    r.id,
    r.username,
    r.roast_text,
    r.votes,
    r.roast_type,
    r.repo_name,
    r.created_at,
    CASE 
        WHEN r.roast_type = 'repo' THEN r.username || '/' || r.repo_name
        ELSE r.username
    END as display_target
FROM public.roasts r
ORDER BY r.votes DESC, r.created_at DESC;

-- Sample data (optional - remove in production)
-- INSERT INTO public.roasts (username, roast_text, roast_type, fingerprint) VALUES
-- ('octocat', 'Sample roast for testing purposes', 'profile', 'sample-fingerprint-1'),
-- ('torvalds', 'Another sample roast', 'profile', 'sample-fingerprint-2');

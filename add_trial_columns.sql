-- Add trial tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

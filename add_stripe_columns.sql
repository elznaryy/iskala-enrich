-- Add Stripe-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end BIGINT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN profiles.current_period_end IS 'Unix timestamp of current billing period end'; 
# Stripe Integration Setup Guide

## 🚀 **Complete Stripe Integration for iSkala Enrich**

This guide covers the complete Stripe integration for subscription management using payment links.

## 📋 **Prerequisites**

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Node.js**: Install the Stripe package: `npm install stripe`
3. **Environment Variables**: Set up your Stripe keys

## 🔧 **Environment Variables Setup**

Create a `.env.local` file with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Payment Links (replace with your actual Stripe payment link URLs)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STARTER=https://buy.stripe.com/starter_plan_link_id
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRO=https://buy.stripe.com/pro_plan_link_id
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_GROWTH=https://buy.stripe.com/growth_plan_link_id
```

## 🛠️ **Stripe Dashboard Setup**

### **1. Create Products & Prices**

1. Go to Stripe Dashboard → Products
2. Create three products:
   - **Starter Plan** ($10/month)
   - **Pro Plan** ($80/month) 
   - **Growth Plan** ($250/month)

3. For each product, create a recurring price:
   - Billing: Monthly
   - Price: $10, $80, $250 respectively
   - Add metadata: `planType: starter/pro/growth`

### **2. Create Payment Links**

1. Go to Stripe Dashboard → Payment Links
2. Create payment links for each plan:

#### **Starter Plan Payment Link**
- **Product**: Starter Plan
- **Price**: $10/month
- **Success URL**: `https://yourdomain.com/dashboard?success=true`
- **Cancel URL**: `https://yourdomain.com/pricing?canceled=true`
- **Metadata**: `planType: starter`

#### **Pro Plan Payment Link**
- **Product**: Pro Plan  
- **Price**: $80/month
- **Success URL**: `https://yourdomain.com/dashboard?success=true`
- **Cancel URL**: `https://yourdomain.com/pricing?canceled=true`
- **Metadata**: `planType: pro`

#### **Growth Plan Payment Link**
- **Product**: Growth Plan
- **Price**: $250/month
- **Success URL**: `https://yourdomain.com/dashboard?success=true`
- **Cancel URL**: `https://yourdomain.com/pricing?canceled=true`
- **Metadata**: `planType: growth`

### **3. Set Up Customer Portal**

1. Go to Stripe Dashboard → Settings → Customer Portal
2. Configure the portal settings:
   - **Allowed features**: Subscription cancellation, payment method updates
   - **Business information**: Your company details
   - **Branding**: Your logo and colors
3. The portal will handle all subscription management automatically

### **3. Set Up Webhooks**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed` - When user completes payment (initial signup + renewals)

4. Copy the webhook secret and add to your `.env.local`

## 📊 **Database Schema Updates**

### **User Subscriptions Table**

```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  plan_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔄 **Webhook Flow**

### **1. User Clicks Payment Link**
```
User → Payment Link → Stripe Checkout → Success/Cancel
```

### **2. Webhook Processing**
```
Stripe Event → Webhook Endpoint → Database Update → User Credits
```

### **3. Event Handling**

#### **Checkout Completed (Initial Signup + Renewals)**
- **Initial Signup**: Allocates credits based on plan
- **Renewal**: Resets credits to plan amount and clears usage
- **Starter**: 50 credits (initial) / 50 credits (renewal)
- **Pro**: 1,000 credits (initial) / 1,000 credits (renewal)  
- **Growth**: 5,000 credits (initial) / 5,000 credits (renewal)

#### **Subscription Management**
- Stripe Customer Portal handles all subscription management
- Users can cancel, upgrade, or downgrade through Stripe
- No additional webhook events needed
- Credits are managed only on successful payments

## 🎯 **Usage Examples**

### **Get Payment Links**
```typescript
import { getPaymentLink } from '@/lib/stripe';

const proPlanLink = getPaymentLink('pro');
// Returns: https://buy.stripe.com/pro_plan_link_id
```

### **Handle Webhook Events**
```typescript
import { handleStripeWebhook } from '@/lib/stripe';

// In your webhook endpoint
await handleStripeWebhook(event);
```

### **Create Customer Portal URL**
```typescript
import { createCustomerPortalUrl } from '@/lib/stripe';

const portalUrl = await createCustomerPortalUrl(customerId, '/dashboard');
// Returns: https://billing.stripe.com/session/...
```

## 🧪 **Testing**

### **Test Payment Links**
1. Use Stripe test mode
2. Use test card: `4242 4242 4242 4242`
3. Any future date for expiry
4. Any 3-digit CVC

### **Test Webhooks**
1. Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Or use Stripe Dashboard → Webhooks → Send test webhook

## 🔒 **Security Best Practices**

1. **Webhook Verification**: Always verify webhook signatures
2. **Environment Variables**: Never commit secrets to version control
3. **Error Handling**: Implement proper error handling for failed payments
4. **Logging**: Log all webhook events for debugging
5. **Rate Limiting**: Implement rate limiting on webhook endpoints

## 📈 **Monitoring**

### **Key Metrics to Track**
- Payment success rate
- Webhook delivery success
- Credit allocation accuracy
- Subscription churn rate

### **Stripe Dashboard Monitoring**
- Go to Stripe Dashboard → Analytics
- Monitor revenue, subscriptions, and webhook events

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Webhook Not Receiving Events**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs

2. **Credits Not Allocated**
   - Verify webhook event processing
   - Check database connection
   - Review webhook handler logic

3. **Payment Link Issues**
   - Verify payment link URLs
   - Check product/price configuration
   - Test with Stripe test mode

## 📞 **Support**

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application-specific issues:
- Check application logs
- Review webhook event processing
- Verify database schema and policies 
# Stripe Integration Setup Guide

## Overview
This document explains how to set up Stripe payment integration for DevScan subscriptions.

## Environment Variables

### Backend (.env in apps/api)
Add the following environment variables:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxx  # Your Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_xxxx  # Webhook signing secret from Stripe

# URLs
CLIENT_URL=http://localhost:3000  # Frontend URL for redirects
```

### Frontend (.env.local in apps/client)
No additional variables needed as the API URL is already configured.

## Stripe Setup Instructions

### 1. Create a Stripe Account
- Go to https://stripe.com
- Sign up for a new account
- Verify your email

### 2. Get API Keys
1. Go to Stripe Dashboard > Developers > API keys
2. Copy your Secret Key (sk_test_xxxx)
3. Paste into the backend .env file as `STRIPE_SECRET_KEY`

### 3. Set Up Webhook
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-api-domain.com/subscription/webhook`
4. Select events to receive:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the Signing secret (whsec_xxxx)
6. Paste into the backend .env file as `STRIPE_WEBHOOK_SECRET`

### 4. Test In Development
For local testing, use Stripe CLI:

```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)

# Login to your account
stripe login

# Forward webhook events to your local setup
stripe listen --forward-to localhost:4000/subscription/webhook

# Copy the webhook signing secret from the output
# Add it to your .env as STRIPE_WEBHOOK_SECRET
```

## Subscription Plans

The system includes three subscription tiers:

### MONTHLY - $9.99/month
- 1 repository scan
- Basic security analysis
- Code quality metrics
- Up to 100 commits per month
- Email support

### QUARTERLY - $24.99/3 months (Best Value)
- 5 repository scans
- Advanced security analysis
- Performance optimization
- Up to 500 commits per month
- Priority email support
- API access

### YEARLY - $79.99/year (Enterprise)
- Unlimited repository scans
- Enterprise security analysis
- AI-powered auto fixes
- Unlimited commits
- 24/7 phone support
- Dedicated account manager
- Custom integrations

## Payment Flow

```
User Signs Up via GitHub
    ↓
Check Subscription Status
    ↓
If No Active Subscription → Redirect to /pricing
    ↓
User Selects Plan
    ↓
Create Stripe Checkout Session
    ↓
User Completes Payment
    ↓
Stripe Webhook Confirms Payment
    ↓
Update User Subscription Status (ACTIVE)
    ↓
User Can Access Dashboard
```

## API Endpoints

### Create Checkout Session
```
POST /subscription/checkout
Headers: Authorization: Bearer {token}
Body: { "plan": "MONTHLY" | "QUARTERLY" | "YEARLY" }
Response: { "sessionId": "...", "url": "https://checkout.stripe.com..." }
```

### Get Subscription Status
```
GET /subscription/status
Headers: Authorization: Bearer {token}
Response: {
  "subscriptionStatus": "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED",
  "subscriptionPlan": "MONTHLY" | "QUARTERLY" | "YEARLY",
  "subscriptionStartDate": "2026-03-29T...",
  "subscriptionEndDate": "2026-04-29T..."
}
```

### Cancel Subscription
```
POST /subscription/cancel
Headers: Authorization: Bearer {token}
Response: { "message": "Subscription cancelled" }
```

### Webhook Handler
```
POST /subscription/webhook
Headers: stripe-signature: {signature}
Body: Raw Stripe event data
```

## Database Schema

The User model has been extended with:

```prisma
stripeCustomerId      String?   @unique
subscriptionStatus    SubscriptionStatus @default(INACTIVE)
subscriptionPlan      SubscriptionPlan?
subscriptionStartDate DateTime?
subscriptionEndDate   DateTime?
stripeSubscriptionId  String?   @unique
```

### Enums
```prisma
enum SubscriptionStatus {
  INACTIVE
  ACTIVE
  EXPIRED
  CANCELLED
}

enum SubscriptionPlan {
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## Testing

### Test Credit Cards
Use these test cards in Stripe's test mode:

- Success: `4242 4242 4242 4242`
- Failure: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

### Create Test Subscription
1. Navigate to `/pricing`
2. Select a plan
3. Use test card `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription status at `/dashboard`

## File Locations

### Backend
- Controller: `apps/api/src/controllers/Subscription.controller.ts`
- Routes: `apps/api/src/routes/subscription.routes.ts`
- Middleware: `apps/api/src/middleware/subscription.ts`
- Schema: `apps/api/prisma/schema.prisma`

### Frontend
- Service: `apps/client/src/services/stripe.service.ts`
- Pricing Page: `apps/client/src/app/(marketing)/pricing/page.tsx`
- Success Page: `apps/client/src/app/success/page.tsx`

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook signing secret is correct in .env
- Ensure API server is running and accessible
- Check server logs for webhook processing errors

### Checkout Session Not Creating
- Verify STRIPE_SECRET_KEY is correct
- Check CORS settings allow Stripe domain
- Ensure user is authenticated (valid JWT token)

### Subscription Not Activating After Payment
- Check webhook is receiving checkout.session.completed event
- Verify user ID is in webhook metadata
- Check database migration was applied successfully
- Review API server logs for errors

## Production Deployment

1. Get production Stripe API keys from Dashboard
2. Update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in production .env
3. Update webhook URL to production domain
4. Use `stripe listen` in development and test webhooks
5. Monitor webhook delivery in Stripe Dashboard

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- DevScan Support: support@devscan.com

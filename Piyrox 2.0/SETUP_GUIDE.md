# Piyrox Setup Guide - Updated Branding & Payment Integration

This guide provides step-by-step instructions for implementing the recent updates to the Piyrox platform, including new branding elements and payment provider changes.

## Table of Contents
1. [New Logo Implementation](#new-logo-implementation)
2. [Updated Favicon](#updated-favicon)
3. [AI Name Change](#ai-name-change)
4. [Payment Provider Migration](#payment-provider-migration)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Testing and Verification](#testing-and-verification)
7. [Webhook Configuration](#webhook-configuration)
8. [Deployment Setup](#deployment-setup)

## New Logo Implementation

The Piyrox logo has been updated with a modern, coding-themed abstract design.

### What Changed:
- Replaced the previous interlocking shapes design with a coding-themed logo
- Added gradient colors (green, cyan, purple) representing technology
- Incorporated bracket symbols and binary dots for a developer aesthetic

### Implementation:
The logo is implemented in `src/components/PIYROXLogo.tsx` as an SVG component. The logo automatically scales based on the `size` prop and can be customized with additional CSS classes via the `className` prop.

```tsx
<PIYROXLogo size={32} className="custom-class" />
```

## Updated Favicon

The favicon has been updated to match the new logo design.

### What Changed:
- New dynamic favicon generated using Next.js ImageResponse
- Coding-themed design with brackets and binary dots
- Gradient background matching the new logo colors

### Implementation:
The favicon is implemented in `src/app/icon.tsx` and will be automatically generated at build time. No additional configuration is needed.

## AI Name Change

The AI assistant name has been changed from "Piyrox AI" to "PiyRox AI" for better branding consistency.

### What Changed:
- Updated greeting message in the chat interface
- Changed header text in the AI chat component
- Updated loading messages to reflect the new name

### Implementation:
The changes are made in `src/components/CustomerAIChat.tsx`. The AI now introduces itself as "PiyRox AI" and all related UI text has been updated accordingly.

## Payment Provider Migration

The crypto payment provider has been migrated from NowPayments to Paymento.io.

### What Changed:
- Created new webhook endpoint for Paymento.io at `/api/webhooks/paymento`
- Updated webhook signature verification (SHA-256 instead of SHA-512)
- Modified payment status handling to match Paymento.io's response format
- Updated API endpoint calls to use Paymento.io's API

### Implementation:

#### 1. Webhook Endpoint
Created a new webhook handler at `src/app/api/webhooks/paymento/route.ts` that:
- Verifies Paymento.io webhook signatures using HMAC-SHA256
- Processes payment notifications for both individual orders and cart payments
- Handles balance top-ups for user accounts
- Logs all webhook events for audit purposes

#### 2. Database Integration
The webhook integrates with the existing database schema:
- Updates order status based on payment confirmation
- Processes digital product delivery for successful payments
- Handles failed payments appropriately
- Manages balance top-ups for user accounts

#### 3. API Integration
The webhook integrates with Paymento.io's API to:
- Fetch payment details when needed for top-up processing
- Verify payment status
- Handle webhook notifications securely

## Environment Variables Configuration

To complete the payment provider migration, you need to configure the following environment variables in your `.env` file:

```env
# Paymento.io Configuration
PAYMENTO_SECRET=your_paymento_secret_key
PAYMENTO_API_KEY=your_paymento_api_key

# Google Analytics Configuration
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-SNVM2YNX2W

# Remove or update these if you're no longer using NowPayments
# NOWPAYMENTS_IPN_SECRET=your_old_nowpayments_secret
# NOWPAYMENTS_API_KEY=your_old_nowpayments_api_key
```

### Getting Paymento.io Credentials:
1. Sign up at [https://app.paymento.io](https://app.paymento.io)
2. Navigate to API settings in your dashboard
3. Generate your API key and secret
4. Add these to your environment variables

## Webhook Configuration

### IPN (Instant Payment Notification) URLs
The system automatically uses the correct webhook URLs for each payment provider:

#### Paymento.io Webhook
- **URL**: `https://yourdomain.com/api/webhooks/paymento`
- **Purpose**: Handles payment confirmations and order updates
- **Signature Verification**: HMAC-SHA256 using `PAYMENTO_SECRET`

#### NOWPayments Webhook (Legacy)
- **URL**: `https://yourdomain.com/api/webhooks/nowpayments`
- **Status**: Still available but no longer the primary payment method

### Webhook Setup in Paymento.io:
1. Log in to your Paymento.io dashboard
2. Navigate to Webhook settings
3. Add the webhook URL: `https://yourdomain.com/api/webhooks/paymento`
4. Set the webhook secret to your `PAYMENTO_SECRET` value
5. Enable webhook notifications for payment events

## Deployment Setup

### Dependencies
The following dependencies have been added to `package.json` for deployment:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.51.1",
    "@tanstack/react-query-devtools": "^5.51.1",
    "sonner": "^1.5.0"
  }
}
```

### Vercel Deployment Steps:
1. Push your code to your Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard:
   - `PAYMENTO_SECRET`
   - `PAYMENTO_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
4. Deploy your application

### Build Process:
The build process will automatically:
- Generate Prisma client
- Build Next.js application
- Generate dynamic favicon
- Process all TypeScript files

## Testing and Verification

### 1. Logo Display Test
- Navigate to your application
- Verify the new logo appears in the navbar and other locations
- Check that the logo scales correctly at different sizes

### 2. Favicon Test
- Bookmark your site
- Check that the favicon appears correctly in browser tabs
- Verify the favicon matches the new logo design

### 3. AI Chat Test
- Open the AI chat interface
- Verify the AI introduces itself as "PiyRox AI"
- Test that all AI messages use the correct naming

### 4. Payment Webhook Test
- Use Paymento.io's test mode to simulate payments
- Verify that webhook notifications are processed correctly
- Check that order status updates appropriately
- Test balance top-up functionality

### 5. Database Verification
- Check the webhook logs table for successful payment processing
- Verify order status changes in the database
- Confirm balance updates for top-up transactions

### 6. Google Analytics Test
- Install Google Analytics Debugger Chrome extension
- Verify that tracking events are being sent correctly
- Check that page views are being recorded

## Troubleshooting

### Common Issues:

1. **Build Errors on Vercel**
   - Ensure all dependencies are listed in `package.json`
   - Check that the build command is `prisma generate && next build`
   - Verify Node.js version is >= 20.0.0

2. **Webhook Signature Verification Fails**
   - Verify the `PAYMENTO_SECRET` is correctly set in your environment
   - Ensure the webhook URL is correctly configured in Paymento.io dashboard
   - Check that the request headers include the correct signature

3. **Payment Not Processed**
   - Verify the payment status in Paymento.io dashboard
   - Check webhook logs for any processing errors
   - Ensure the order ID format matches expected patterns

4. **Logo Display Issues**
   - Check that the PIYROXLogo component is properly imported
   - Verify CSS classes are not overriding the logo styling
   - Ensure the component is being used with appropriate size props

5. **Google Analytics Not Tracking**
   - Verify the `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is set correctly
   - Check that the Google Analytics script is loading in the browser
   - Ensure the domain is properly configured in Google Analytics

## Support

If you encounter any issues with these updates:
1. Check the console logs for error messages
2. Verify all environment variables are correctly set
3. Ensure all files have been properly deployed
4. Contact the development team with specific error details

---

*This guide was last updated with the Piyrox branding refresh on June 8, 2026.*
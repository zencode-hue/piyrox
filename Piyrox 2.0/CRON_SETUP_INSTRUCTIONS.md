# Cron Job Setup Instructions for Product Review Automation

## Overview
This guide will help you set up an automated cron job that posts realistic product reviews to your Discord channel using console.cron-job.org.

## Security Token
Your generated security token is:
```
80ab304eca4412286745f9770c332a38
```

## Step 1: Environment Configuration

### 1.1 Add Security Token to .env
Add the following line to your `.env` file:
```bash
CRON_SECURITY_TOKEN=80ab304eca4412286745f9770c332a38
```

### 1.2 Optional: Configure Discord Webhook
If you want to use a specific Discord channel for reviews, add this to your `.env`:
```bash
DISCORD_REVIEW_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```
If not specified, it will fall back to your main `DISCORD_WEBHOOK_URL`.

## Step 2: Cron Job Configuration Options

You have two options for setting up the cron job:

### Option A: Using console.cron-job.org (Recommended for most users)

#### 2.1 Basic Settings
- **Job Name**: "PIYROX Product Review Poster"
- **Job URL**: `https://www.piyrox.sbs/api/cron/product-review`
  - **Important**: Use `www.piyrox.sbs` (not `piyrox.sbs`)
  - The non-www version redirects to www version
- **Request Method**: GET

#### 2.2 Security Headers
- **Header Name**: `X-Cron-Security-Token`
- **Header Value**: `80ab304eca4412286745f9770c332a38`

#### 2.3 Schedule Settings
- **Schedule Type**: "Periodic"
- **Time Zone**: Select your timezone (e.g., Africa/Lagos)
- **Frequency**: Choose how often you want reviews posted
  - Recommended: Every 6 hours or daily
- **Start Date**: Today's date
- **End Date**: Leave empty for continuous operation

#### 2.4 Notification Settings (Optional)
- **Notification Email**: Your email address for error alerts
- **Notification on Success**: Enable if you want success notifications

#### 2.5 Advanced Settings
- **Timeout**: 30 seconds
- **Retries**: 3
- **User Agent**: "PIYROX-Cron/1.0"

### Option B: Using Direct Cron (For advanced users)

If you prefer to set up the cron job directly on your server, use this command:

```bash
# Run every 3 hours
0 */3 * * * curl -H "X-Cron-Security-Token: 80ab304eca4412286745f9770c332a38" -m 30 https://www.piyrox.sbs/api/cron/product-review > /dev/null
```

#### Cron Format Explanation:
- `0 */3 * * *` - At minute 0, every 3rd hour
- `-H` - Adds the security header
- `-m 30` - Sets timeout to 30 seconds
- `> /dev/null` - Suppresses output

**Important**: Use `https://www.piyrox.sbs/api/cron/product-review` (with `www`) as the direct URL. The non-www version redirects and may cause issues with some cron systems.

To modify the frequency:
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at midnight: `0 0 * * *`

## Step 3: Testing the Endpoint

Before setting up the cron job, test your endpoint manually:

### 3.1 Using curl
```bash
# Test with the correct URL (with www)
curl -H "X-Cron-Security-Token: 80ab304eca4412286745f9770c332a38" \
     https://www.piyrox.sbs/api/cron/product-review

# For debugging, use verbose mode
curl -v -H "X-Cron-Security-Token: 80ab304eca4412286745f9770c332a38" \
     https://www.piyrox.sbs/api/cron/product-review
```

### 3.2 Expected Response
```json
{
  "ok": true,
  "product": "Product Name",
  "customer": "Random Customer Name",
  "rating": 4,
  "message": "Review posted successfully"
}
```

### 3.3 Verify Discord Post
Check your Discord channel for the review post. It should appear as a formatted embed with:
- Product name and price
- Customer name and avatar
- Star rating with color coding
- Review text
- Review timestamp

### 3.4 Debugging Tips
- If you get a redirect, make sure you're using `www.piyrox.sbs`
- Check the response headers to understand redirects
- Use verbose mode (`-v`) to see the full request/response flow
- Test multiple times to ensure different products/reviews are generated

## Step 4: Troubleshooting

### 4.1 Common Issues

#### Unauthorized Error (401)
- Check that the security token matches exactly
- Ensure the header name is `X-Cron-Security-Token` (case-sensitive)

#### No Webhook Configured (503)
- Verify your Discord webhook URL is correct
- Check that the webhook has permissions to send messages

#### No Active Products Found
- Ensure you have products with `isActive: true` in your database
- Check your database connection

### 4.2 Testing Tips
- Test the endpoint multiple times to ensure different products/reviews are generated
- Check your Discord channel for the formatted embed messages
- Monitor the console.cron-job.org dashboard for job execution status

## Step 5: Monitoring

### 5.1 Console.cron-job.org Dashboard
- Check the job status regularly
- Monitor execution logs for any errors
- Verify the next execution time

### 5.2 Discord Channel
- Review the posted messages for formatting and content
- Ensure the variety of reviews (3-5 stars) is appropriate

### 5.3 Application Logs
- Check your application logs for any errors
- Monitor the `[CRON product-review]` log entries

## Security Notes

- Never share your security token publicly
- Regularly rotate your token for enhanced security
- Ensure your Discord webhook URLs are kept secure
- Monitor for any unauthorized access attempts

## Technical Details

### Review Generation Logic
- Randomly selects from 150+ customer names
- Generates reviews with 3-5 star ratings
- Matches review sentiment to star rating
- Includes realistic delivery time variations
- Slightly randomizes price (±5%) for authenticity

### Database Integration
- Fetches random active products from your database
- Uses Prisma ORM for efficient querying
- Implements seeded random selection for variety

### Discord Integration
- Uses existing `sendDiscordNotification` utility
- Formats messages as rich embeds
- Color-coded based on star rating
- Includes customer avatars using UI Avatars API

---

For support or questions, refer to the project documentation or contact the development team.
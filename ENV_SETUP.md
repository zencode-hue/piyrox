# Environment Setup Guide

## Local Development

The `.env.local` file is already configured with all necessary variables for local development.

## Production Deployment (Render)

### Step 1: Add Environment Variables to Render

Go to your Render service dashboard and add these environment variables:

```
SUPABASE_DB_URL=postgresql://postgres.btudtqxqmdirbvxxqumr:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres

JWT_SECRET=[YOUR-JWT-SECRET]

RESEND_API_KEY=[YOUR-RESEND-API-KEY]

RESEND_FROM_EMAIL=support@piyrox.sbs

OPENROUTER_API_KEY=[YOUR-OPENROUTER-API-KEY]

NODE_ENV=production
```

### Step 2: Redeploy

After adding the environment variables, trigger a new deployment on Render.

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `SUPABASE_DB_URL` | PostgreSQL database connection | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | JWT token signing secret | 64-character hex string |
| `RESEND_API_KEY` | Email service API key | `re_xxxxx...` |
| `RESEND_FROM_EMAIL` | Email sender address | `support@piyrox.sbs` |
| `OPENROUTER_API_KEY` | AI model API key | `sk-or-v1-xxxxx...` |
| `NODE_ENV` | Environment mode | `production` |

## Security Notes

⚠️ **IMPORTANT**: Never commit `.env.local` or `.env.production` to version control. These files contain sensitive credentials.

The `.gitignore` should already exclude these files, but verify:
- `.env.local` ✓
- `.env.production` ✓

## Getting Your Credentials

### Supabase Database URL
1. Go to Supabase dashboard
2. Project Settings → Database
3. Copy the "Connection string" (IPv4)
4. Replace `[YOUR-PASSWORD]` with your actual password

### JWT Secret
Generate a secure 64-character hex string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Resend API Key
1. Go to Resend dashboard
2. Copy your API key from Settings

### OpenRouter API Key
1. Go to OpenRouter dashboard
2. Copy your API key from Settings

## Testing the Setup

1. **Local**: Run `npm run dev` and test login/signup
2. **Production**: After deployment, test at your Render URL

## Troubleshooting

### "OpenRouter API key not configured"
- Verify `OPENROUTER_API_KEY` is set in Render environment variables
- Redeploy after adding the variable

### "Database connection failed"
- Check `SUPABASE_DB_URL` is correct
- Verify Supabase is accessible from Render's IP

### "Email verification not working"
- Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
- Check Resend dashboard for API key validity


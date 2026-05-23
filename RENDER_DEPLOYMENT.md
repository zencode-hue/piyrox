# PiyRox Next - Render Deployment Guide

**Status**: Ready for Render Deployment  
**Last Updated**: May 23, 2026

---

## 🚀 Quick Deployment to Render

### Step 1: Connect GitHub Repository

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `zencode-hue/piyrox`
5. Click "Connect"

### Step 2: Configure Service

**Name**: `piyrox-next`  
**Environment**: `Node`  
**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start`  
**Plan**: Free (or Starter for production)

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
NEXT_PUBLIC_APP_URL=https://piyrox-next.onrender.com
SUPABASE_DB_URL=postgresql://postgres.btudtqxqmdirbvxxqumr:Fadekemi123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
RESEND_API_KEY=re_GMCSNR9r_Gi9EirSRYn8tTMirFoJH97AY
RESEND_FROM_EMAIL=support@piyrox.sbs
JWT_SECRET=e9b2518e38d7a12b6f12e8b091f2c4d5a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2
NODE_ENV=production
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://piyrox-next.onrender.com`

---

## ✅ Verify Deployment

After deployment, test these URLs:

- **Home**: `https://piyrox-next.onrender.com`
- **Signup**: `https://piyrox-next.onrender.com/signup`
- **Login**: `https://piyrox-next.onrender.com/login`
- **Products**: `https://piyrox-next.onrender.com/products`
- **Admin**: `https://piyrox-next.onrender.com/admin`

### Test Signup Flow
1. Go to `/signup`
2. Create account with test email
3. Check email for verification link
4. Click link to verify
5. Go to `/login` and login

---

## 🔧 Environment Variables

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| NEXT_PUBLIC_APP_URL | Your Render URL | For email verification links |
| SUPABASE_DB_URL | Database URL | PostgreSQL connection string |
| RESEND_API_KEY | Your API key | From Resend dashboard |
| RESEND_FROM_EMAIL | support@piyrox.sbs | Email sender address |
| JWT_SECRET | Random string | For session management |
| NODE_ENV | production | Set to production |

### Update NEXT_PUBLIC_APP_URL

Replace `https://piyrox-next.onrender.com` with your actual Render URL:

1. Go to Render dashboard
2. Select your service
3. Go to "Environment"
4. Update `NEXT_PUBLIC_APP_URL` with your URL
5. Redeploy

---

## 📊 Monitoring

### View Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs

### Common Issues

**Build Failed**
- Check build logs
- Verify Node.js version
- Check for missing dependencies

**App Not Starting**
- Check start command
- Verify environment variables
- Check for runtime errors

**Email Not Sending**
- Verify RESEND_API_KEY
- Check email domain in Resend
- Review logs for errors

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "message"`
3. Push: `git push origin main`
4. Render automatically builds and deploys
5. Check deployment status in Render dashboard

---

## 🆘 Troubleshooting

### Build Fails
```
Solution: Check build logs in Render dashboard
- Verify package.json is correct
- Check for missing dependencies
- Ensure Node.js version is compatible
```

### App Crashes on Start
```
Solution: Check start logs
- Verify npm start command works locally
- Check environment variables are set
- Review error messages in logs
```

### Email Not Sending
```
Solution: Verify Resend configuration
- Check RESEND_API_KEY is correct
- Verify email domain in Resend
- Check logs for email errors
```

### Database Connection Error
```
Solution: Verify database connection
- Check SUPABASE_DB_URL is correct
- Verify database is running
- Check network connectivity
```

---

## 📈 Performance

### Render Free Plan
- 0.5 GB RAM
- Shared CPU
- 100 GB bandwidth/month
- Auto-sleep after 15 min inactivity

### Upgrade to Starter
- 0.5 GB RAM
- Dedicated CPU
- Unlimited bandwidth
- No auto-sleep
- $7/month

### Upgrade to Standard
- 1 GB RAM
- Dedicated CPU
- Unlimited bandwidth
- No auto-sleep
- $12/month

---

## 🔒 Security

- ✅ HTTPS enabled by default
- ✅ Environment variables encrypted
- ✅ GitHub integration secure
- ✅ Auto-SSL certificates
- ✅ DDoS protection

---

## 📝 Deployment Checklist

Before deploying:

- [ ] All code committed to GitHub
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] Resend API key valid
- [ ] Build command tested locally
- [ ] Start command tested locally

After deploying:

- [ ] Service is running
- [ ] Logs show no errors
- [ ] Home page loads
- [ ] Signup works
- [ ] Email verification works
- [ ] Login works
- [ ] Products page loads
- [ ] Admin dashboard accessible

---

## 🚀 Next Steps

1. **Deploy** - Follow steps above
2. **Test** - Verify all features work
3. **Monitor** - Check logs regularly
4. **Optimize** - Upgrade plan if needed
5. **Maintain** - Keep dependencies updated

---

## 📞 Support

### Render Support
- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Support](https://support.render.com)

### Project Support
- Check QUICK_REFERENCE.md
- Review README_COMPLETE.md
- Check deployment logs

---

## 🎯 Deployment Summary

**Service**: piyrox-next  
**Platform**: Render  
**Repository**: zencode-hue/piyrox  
**Branch**: main  
**Build Time**: ~5-10 minutes  
**Status**: Ready to Deploy

---

**Last Updated**: May 23, 2026  
**Version**: 0.2.0  
**Status**: Production Ready

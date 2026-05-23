# 🚀 PiyRox IDE - Installation & Setup Guide

## What is PiyRox IDE?

A **VS Code-like IDE** that users download as a ZIP file, extract, and run locally. It connects to your backend for:
- ✅ User authentication (login/signup)
- ✅ Plan management (free/pro/enterprise)
- ✅ Project management
- ✅ File storage and sync
- ✅ Real-time collaboration

## 📦 Installation for End Users

### Step 1: Download
Users download `piyrox-ide-2.1.0.zip` from your website

### Step 2: Extract
```bash
# Windows
Right-click → Extract All

# macOS/Linux
unzip piyrox-ide-2.1.0.zip
```

### Step 3: Install Dependencies
```bash
cd piyrox-ide
npm install
```

### Step 4: Start the IDE
```bash
npm start
```

This will:
1. Start the backend server (port 5000)
2. Open the IDE in browser (port 3000)
3. Show login screen

### Step 5: Login/Signup
- Create account or login
- Choose plan
- Start coding!

---

## 🔧 Developer Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- PostgreSQL database (Supabase)

### Installation

```bash
# Clone repository
git clone https://github.com/zencode-hue/piyrox.git
cd piyrox-ide-vscode

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

Create `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
# OR use Supabase
SUPABASE_DB_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000
```

### Development

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Create ZIP for distribution
npm run package
```

---

## 🗄️ Database Setup

### Automatic (Recommended)
The app automatically creates tables on first run:
- `users` - User accounts
- `projects` - User projects
- `files` - Project files

### Manual Setup

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  api_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  content TEXT,
  language VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication Flow

### Signup
1. User enters name, email, password
2. Backend hashes password with bcrypt
3. Creates user in database
4. Generates JWT token
5. Returns token + user data
6. Frontend stores in localStorage

### Login
1. User enters email, password
2. Backend verifies credentials
3. Generates JWT token
4. Returns token + user data
5. Frontend stores in localStorage

### Protected Routes
All API calls include JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 💳 Plan Management

### Plans Available
- **Free**: 5 projects, 1GB storage
- **Pro**: Unlimited projects, 100GB storage, AI assistant
- **Enterprise**: Everything unlimited, team collaboration

### Upgrade Flow
1. User clicks "Upgrade Plan"
2. Selects new plan
3. Backend updates user plan in database
4. Frontend refreshes user data
5. New features become available

---

## 📁 Project Structure

```
piyrox-ide-vscode/
├── server.js                 # Express backend
├── package.json              # Dependencies
├── .env                      # Environment variables
├── src/
│   ├── App.jsx              # Main React app
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── IDEPage.jsx
│   │   └── PlanPage.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── FileExplorer.jsx
│   │   └── Terminal.jsx
│   ├── styles/
│   │   ├── Auth.css
│   │   ├── IDE.css
│   │   └── Plans.css
│   └── index.jsx
├── public/
│   └── index.html
├── dist/                    # Built files
└── README.md
```

---

## 🚀 Deployment

### Deploy Backend

**Option 1: Render**
```bash
# Push to GitHub
git push origin main

# Connect to Render
# Set environment variables
# Deploy
```

**Option 2: Heroku**
```bash
heroku create piyrox-ide
heroku config:set DATABASE_URL=...
git push heroku main
```

### Deploy Frontend

**Option 1: Vercel**
```bash
npm run build
vercel deploy
```

**Option 2: Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Create Distribution ZIP

```bash
npm run package
# Creates: piyrox-ide-2.1.0.zip
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login user

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans/upgrade` - Upgrade plan

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project

### Files
- `GET /api/files/:projectId` - Get project files
- `POST /api/files` - Create file
- `PUT /api/files/:fileId` - Update file

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database is running
- Verify credentials

### Frontend Won't Load
- Check backend is running on port 5000
- Verify VITE_API_URL in .env
- Check browser console for errors

### Login Not Working
- Verify database tables exist
- Check JWT_SECRET is set
- Review server logs

---

## 📊 Monitoring

### Logs
```bash
# Backend logs
npm run server

# Frontend logs
npm run dev
```

### Database
```bash
# Connect to database
psql $DATABASE_URL

# Check users
SELECT * FROM users;

# Check projects
SELECT * FROM projects;
```

---

## 🔄 Updates

### Update IDE
1. Download new version
2. Extract to new folder
3. Run `npm install`
4. Run `npm start`

### Update Backend
1. Pull latest code
2. Run `npm install`
3. Restart server

---

## 📝 Configuration

### Change Port
Edit `.env`:
```env
PORT=8000
```

### Change Database
Edit `.env`:
```env
DATABASE_URL=postgresql://new-url
```

### Change Frontend URL
Edit `.env`:
```env
VITE_API_URL=https://api.piyrox.sbs
```

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure database
3. ✅ Set environment variables
4. ✅ Run development server
5. ✅ Test login/signup
6. ✅ Build for production
7. ✅ Create distribution ZIP
8. ✅ Deploy backend
9. ✅ Upload to website

---

## 📞 Support

- 📖 [Documentation](https://docs.piyrox.sbs)
- 🐛 [Report Issues](https://github.com/zencode-hue/piyrox/issues)
- 📧 [Email Support](mailto:support@piyrox.sbs)

---

**Version**: 2.1.0  
**Last Updated**: May 23, 2026  
**Status**: Production Ready

🚀 **Ready to deploy!**

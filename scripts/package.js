import fs from 'fs';
import path from 'path';

console.log('📦 Preparing package...\n');

// Create .env.example if it doesn't exist
const envExample = `# PiyRox IDE Environment Variables

# Database
DATABASE_URL=postgresql://user:password@host:port/database
# OR use Supabase
SUPABASE_DB_URL=postgresql://...

# JWT Secret
JWT_SECRET=your_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend Configuration
VITE_API_URL=http://localhost:5000
`;

fs.writeFileSync('.env.example', envExample);
console.log('✅ Created .env.example');

// Create README if it doesn't exist
const readme = `# 🚀 PiyRox IDE v2.1.0

AI-Powered VS Code-like Development Environment

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database URL and JWT secret

# Start the IDE
npm start
\`\`\`

## Features

- 🎨 VS Code-like interface
- 📝 Monaco Editor with syntax highlighting
- 🔐 User authentication with database
- 💳 Plan management (free/pro/enterprise)
- 📁 Project management
- 🔄 Real-time file sync
- ⌨️ Integrated terminal
- 🌙 Dark theme

## Documentation

See INSTALLATION_GUIDE.md for detailed setup instructions.

## Support

- 📧 support@piyrox.sbs
- 🐛 GitHub Issues
- 📖 Documentation

---

**Version**: 2.1.0  
**Status**: Production Ready
`;

fs.writeFileSync('README.md', readme);
console.log('✅ Created README.md');

// Create .gitignore
const gitignore = `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
piyrox-ide-*.zip
`;

fs.writeFileSync('.gitignore', gitignore);
console.log('✅ Created .gitignore');

console.log('\n✅ Package preparation complete!');
console.log('\nNext steps:');
console.log('1. Edit .env with your database URL');
console.log('2. Run: npm install');
console.log('3. Run: npm run build');
console.log('4. Run: npm run create-zip');

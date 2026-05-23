import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const version = '2.1.0';
const zipName = `piyrox-ide-${version}.zip`;

console.log('📦 Creating distribution package...');

// Files to include in ZIP
const filesToInclude = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'README.md',
  'INSTALLATION_GUIDE.md',
  'dist/',
  'node_modules/',
  'public/',
  'scripts/'
];

// Create ZIP
try {
  console.log(`✅ Creating ${zipName}...`);
  
  // Windows
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path ${filesToInclude.join(',')} -DestinationPath ${zipName} -Force"`, {
      stdio: 'inherit'
    });
  } else {
    // macOS/Linux
    execSync(`zip -r ${zipName} ${filesToInclude.join(' ')}`, {
      stdio: 'inherit'
    });
  }

  const stats = fs.statSync(zipName);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`\n✅ Package created successfully!`);
  console.log(`📦 File: ${zipName}`);
  console.log(`📊 Size: ${sizeMB} MB`);
  console.log(`\n🚀 Ready for distribution!`);
  console.log(`\nUsers can now:`);
  console.log(`1. Download ${zipName}`);
  console.log(`2. Extract the ZIP`);
  console.log(`3. Run: npm install`);
  console.log(`4. Run: npm start`);

} catch (error) {
  console.error('❌ Error creating package:', error.message);
  process.exit(1);
}

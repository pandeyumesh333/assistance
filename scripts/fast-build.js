const fs = require('fs');
const { execSync } = require('child_process');

const pkgPath = './package.json';
const pkgBackupPath = './package.json.bak';

// 1. Backup original package.json
fs.copyFileSync(pkgPath, pkgBackupPath);

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // 2. Remove bloat packages
  const bloat = [
    'expo-dev-client', 
    'react-native-chart-kit', 
    'react-native-svg'
  ];
  
  bloat.forEach(p => {
    if (pkg.dependencies) delete pkg.dependencies[p];
  });

  // 3. Save "Clean" package.json
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log('✅ Stripped development packages. Starting EAS build...');

  // 4. Run EAS Build
  execSync('eas build -p android --profile preview', { stdio: 'inherit' });

} catch (err) {
  console.error('❌ Build failed:', err.message);
} finally {
  // 5. Restore original package.json
  fs.copyFileSync(pkgBackupPath, pkgPath);
  fs.unlinkSync(pkgBackupPath);
  console.log('✅ Restored development packages.');
}

const fs = require('fs');
const { execSync } = require('child_process');

if (fs.existsSync('./frontend/package.json')) {
  execSync('npm run build --prefix frontend && rm -rf dist && cp -r frontend/dist ./dist', { stdio: 'inherit' });
} else {
  execSync('npx vite build', { stdio: 'inherit' });
}

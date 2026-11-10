const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'data');
const backupDir = path.join(__dirname, '..', 'src', 'data_backup_legacy_26');

console.log('Backing up:', srcDir);
console.log('To:', backupDir);

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(srcDir, backupDir);
console.log('Backup completed successfully!');

const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const appinfoPath = path.resolve(__dirname, '../public/appinfo.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const appinfo = JSON.parse(fs.readFileSync(appinfoPath, 'utf8'));

  if (appinfo.version !== pkg.version) {
    appinfo.version = pkg.version;
    fs.writeFileSync(appinfoPath, JSON.stringify(appinfo, null, 2) + '\n');
    console.log(`[Version Sync] Updated appinfo.json version to ${pkg.version}`);
  }
} catch (err) {
  console.error('[Version Sync] Failed to sync versions:', err.message);
  process.exit(1);
}

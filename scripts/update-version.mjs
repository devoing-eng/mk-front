/**
 * Script to update version.json with current build version
 * Run this before building the Next.js app
 */
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate version ID using the same format as your generateBuildId
const version = `build-${Date.now()}`;
const versionFile = path.join(__dirname, '../public/version.json');

try {
  // Create version.json content
  const content = JSON.stringify({
    version: version,
    timestamp: Date.now()
  }, null, 2);
  
  // Write to file
  fs.writeFileSync(versionFile, content);
  console.log(`✅ Version updated to ${version}`);
} catch (error) {
  console.error('❌ Failed to update version:', error);
  process.exit(1);
}
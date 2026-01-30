#!/usr/bin/env node
/**
 * Ensures React Native iOS codegen output exists before building.
 * Run before `yarn ios` so Pods find RCTAppDependencyProvider.h and related files.
 * Required after cleaning ios/build (e.g. rm -rf ios/build).
 */

const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const codegenMarker = path.join(
  projectRoot,
  'ios',
  'build',
  'generated',
  'ios',
  'RCTAppDependencyProvider.h',
);

if (fs.existsSync(codegenMarker)) {
  process.exit(0);
}

console.log('[ensure-ios-codegen] Generating iOS codegen artifacts...');
const codegenScript = path.join(
  projectRoot,
  'node_modules',
  'react-native',
  'scripts',
  'generate-codegen-artifacts.js',
);
const outputDir = path.join(projectRoot, 'ios', 'build', 'generated', 'ios');

try {
  execSync(
    `node "${codegenScript}" --path "${projectRoot}" --targetPlatform ios --outputPath "${outputDir}"`,
    {stdio: 'inherit', cwd: projectRoot},
  );
} catch (e) {
  console.error('[ensure-ios-codegen] Codegen failed:', e.message);
  process.exit(1);
}

// Codegen may write to a nested path; move to expected path if needed
const nestedDir = path.join(outputDir, 'build', 'generated', 'ios');
if (
  fs.existsSync(nestedDir) &&
  fs.existsSync(path.join(nestedDir, 'RCTAppDependencyProvider.h'))
) {
  const topDir = path.join(outputDir);
  const moveDir = path.join(outputDir, 'build', 'generated', 'ios');
  const entries = fs.readdirSync(moveDir, {withFileTypes: true});
  for (const ent of entries) {
    const src = path.join(moveDir, ent.name);
    const dest = path.join(topDir, ent.name);
    if (fs.existsSync(dest)) {
      if (ent.isDirectory()) {
        fs.rmSync(dest, {recursive: true});
      } else {
        fs.unlinkSync(dest);
      }
    }
    fs.renameSync(src, dest);
  }
  fs.rmSync(path.join(outputDir, 'build'), {recursive: true});
  console.log('[ensure-ios-codegen] Moved codegen output to expected path.');
}

if (!fs.existsSync(codegenMarker)) {
  console.error(
    '[ensure-ios-codegen] RCTAppDependencyProvider.h still missing after codegen.',
  );
  process.exit(1);
}
console.log('[ensure-ios-codegen] Done.');

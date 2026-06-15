#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function getFirestorePort() {
  const explicitHost = process.env.FIRESTORE_EMULATOR_HOST || '';
  const hostPort = explicitHost.split(':')[1];
  const configuredPort = process.env.FIRESTORE_EMULATOR_PORT || hostPort;

  if (configuredPort) {
    const parsed = Number(configuredPort);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`Invalid Firestore emulator port: ${configuredPort}`);
    }
    return parsed;
  }

  return 8085;
}

const port = getFirestorePort();
const rootDir = path.resolve(__dirname, '..');
const baseConfigPath = path.join(rootDir, 'firebase.json');
const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shopmatch-rules-'));
const tempConfigPath = path.join(tempDir, 'firebase.json');
const firebaseBin = path.join(rootDir, 'node_modules', '.bin', 'firebase');

baseConfig.emulators = {
  ...(baseConfig.emulators || {}),
  firestore: {
    ...((baseConfig.emulators && baseConfig.emulators.firestore) || {}),
    port,
  },
};

if (baseConfig.firestore) {
  baseConfig.firestore = {
    ...baseConfig.firestore,
    rules: path.join(rootDir, baseConfig.firestore.rules || 'firestore.rules'),
    indexes: path.join(rootDir, baseConfig.firestore.indexes || 'firestore.indexes.json'),
  };
}

try {
  fs.writeFileSync(tempConfigPath, JSON.stringify(baseConfig, null, 2));

  const env = {
    ...process.env,
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || `localhost:${port}`,
    FIRESTORE_EMULATOR_PORT: String(port),
  };
  delete env.DEBUG;

  const result = spawnSync(
    firebaseBin,
    [
      '-c',
      tempConfigPath,
      'emulators:exec',
      '--only',
      'firestore',
      '--project',
      'shopmatch-pro-test',
      'node test-firestore-rules.js',
    ],
    {
      cwd: rootDir,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

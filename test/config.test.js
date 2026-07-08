const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadConfig } = require('../config');

test('prefers environment values for the Aternos server configuration', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-bot-'));
  const configFile = path.join(tempDir, 'config.json');

  fs.writeFileSync(
    configFile,
    JSON.stringify({
      host: 'old.example.com',
      port: 25565,
      username: 'OldBot',
      version: '1.20.1',
      auth: 'offline'
    })
  );

  const config = loadConfig({
    cwd: tempDir,
    env: {
      MC_HOST: 'YT_MC_power81.aternos.me',
      MC_PORT: '28772',
      MC_USERNAME: 'BotAFK',
      MC_VERSION: '1.21.11',
      MC_AUTH: 'offline'
    }
  });

  assert.equal(config.host, 'YT_MC_power81.aternos.me');
  assert.equal(config.port, 28772);
  assert.equal(config.username, 'BotAFK');
  assert.equal(config.version, '1.21.11');
  assert.equal(config.auth, 'offline');
});

test('uses config.json values for the server and only overrides the username when MC_USERNAME is provided', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-bot-'));
  const configFile = path.join(tempDir, 'config.json');

  fs.writeFileSync(
    configFile,
    JSON.stringify({
      host: 'server.example.com',
      port: 25566,
      username: 'StoredBot',
      version: '1.21.11',
      auth: 'offline'
    })
  );

  const config = loadConfig({ cwd: tempDir, env: { MC_USERNAME: 'MCbot' } });

  assert.equal(config.host, 'server.example.com');
  assert.equal(config.port, 25566);
  assert.equal(config.username, 'MCbot');
  assert.equal(config.version, '1.21.11');
  assert.equal(config.auth, 'offline');
});

test('falls back to config.json when no environment variables are provided', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-bot-'));
  const configFile = path.join(tempDir, 'config.json');

  fs.writeFileSync(
    configFile,
    JSON.stringify({
      host: 'server.example.com',
      port: 25566,
      username: 'StoredBot',
      version: '1.21.11',
      auth: 'offline'
    })
  );

  const config = loadConfig({ cwd: tempDir, env: {} });

  assert.equal(config.host, 'server.example.com');
  assert.equal(config.port, 25566);
  assert.equal(config.username, 'StoredBot');
  assert.equal(config.version, '1.21.11');
  assert.equal(config.auth, 'offline');
});

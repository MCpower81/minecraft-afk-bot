const fs = require('node:fs');
const path = require('node:path');

function loadConfig(options = {}) {
  const env = options.env || process.env;
  const cwd = options.cwd || process.cwd();
  const configPath = path.join(cwd, 'config.json');

  const config = {
    host: 'localhost',
    port: 25565,
    username: 'BotAFK',
    version: '1.21.11',
    auth: 'offline'
  };

  if (fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    Object.assign(config, raw);
  }

  if (env.MC_HOST?.trim()) config.host = env.MC_HOST.trim();
  if (env.MC_PORT?.trim()) config.port = Number.parseInt(env.MC_PORT, 10);
  if (env.MC_USERNAME?.trim()) config.username = env.MC_USERNAME.trim();
  if (env.MC_VERSION?.trim()) config.version = env.MC_VERSION.trim();
  if (env.MC_AUTH?.trim()) config.auth = env.MC_AUTH.trim();

  return config;
}

module.exports = { loadConfig };

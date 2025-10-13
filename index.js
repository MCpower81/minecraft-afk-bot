const mineflayer = require('mineflayer');
const fs = require('fs');

let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (error) {
  console.error('Error reading config.json. Please create it based on config.example.json');
  process.exit(1);
}

let bot;
let afkTimeout = null;
let isRunning = false;
let shouldReconnect = true;

function createBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth
  });

  bot.on('login', () => {
    console.log(`✅ Bot logged in as ${bot.username}`);
    console.log(`📍 Connected to ${config.host}:${config.port}`);
    startAFKActions();
  });

  bot.on('spawn', () => {
    console.log('🎮 Bot spawned in the world');
  });

  bot.on('death', () => {
    console.log('💀 Bot died! Respawning in 2 seconds...');
    setTimeout(() => {
      bot.respawn();
      console.log('♻️ Bot respawned');
    }, 2000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`💬 ${username}: ${message}`);
  });

  bot.on('kicked', (reason) => {
    console.log(`⛔ Bot was kicked: ${reason}`);
    stopAFKActions();
    reconnect();
  });

  bot.on('end', () => {
    console.log('🔌 Disconnected from server');
    stopAFKActions();
    reconnect();
  });

  bot.on('error', (err) => {
    console.error('❌ Error:', err.message);
  });
}

function reconnect() {
  if (!shouldReconnect) return;
  
  console.log('🔄 Reconnecting in 5 seconds...');
  setTimeout(() => {
    if (shouldReconnect) {
      console.log('🔌 Attempting to reconnect...');
      createBot();
    }
  }, 5000);
}

function startAFKActions() {
  console.log('🤖 Starting AFK actions...');
  isRunning = true;
  scheduleNextAction();
}

function stopAFKActions() {
  if (afkTimeout) {
    clearTimeout(afkTimeout);
    afkTimeout = null;
  }
  isRunning = false;
  console.log('⏹️  Stopped AFK actions');
}

function scheduleNextAction() {
  if (!isRunning) return;
  
  performRandomAction();
  
  const nextInterval = getRandomInterval(3000, 8000);
  afkTimeout = setTimeout(() => {
    scheduleNextAction();
  }, nextInterval);
}

function performRandomAction() {
  const actions = [
    () => randomLook(),
    () => randomJump(),
    () => randomMovement(),
    () => randomSneak()
  ];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  action();
}

function randomLook() {
  const yaw = Math.random() * Math.PI * 2;
  const pitch = (Math.random() - 0.5) * Math.PI * 0.5;
  bot.look(yaw, pitch);
  console.log('👀 Looking around...');
}

function randomJump() {
  if (bot.entity && bot.entity.onGround) {
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 100);
    console.log('🦘 Jumping...');
  }
}

function randomMovement() {
  const movements = ['forward', 'back', 'left', 'right'];
  const direction = movements[Math.floor(Math.random() * movements.length)];
  
  bot.setControlState(direction, true);
  setTimeout(() => {
    bot.setControlState(direction, false);
  }, getRandomInterval(500, 1500));
  
  console.log(`🚶 Moving ${direction}...`);
}

function randomSneak() {
  bot.setControlState('sneak', true);
  setTimeout(() => {
    bot.setControlState('sneak', false);
  }, getRandomInterval(1000, 3000));
  console.log('🤫 Sneaking...');
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  shouldReconnect = false;
  stopAFKActions();
  if (bot) {
    bot.quit();
  }
  process.exit(0);
});

console.log('🚀 Starting Minecraft AFK Bot...');
console.log(`📋 Server: ${config.host}:${config.port}`);
console.log(`👤 Username: ${config.username}`);
console.log(`🎮 Version: ${config.version}`);
console.log('🔄 Auto-reconnect: Enabled');
console.log('♻️ Auto-respawn: Enabled');
console.log('\nPress Ctrl+C to stop the bot\n');

createBot();

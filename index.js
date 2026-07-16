const mineflayer = require('mineflayer');
require('dotenv').config();
const { loadConfig } = require('./config');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder } = require('mineflayer-pathfinder');

let config;

try {
  config = loadConfig();
  console.log('📝 Using configuration from environment variables or config.json');
} catch (error) {
  console.error('❌ No configuration found!');
  console.error('Please either:');
  console.error('  1. Set environment variables (MC_HOST, MC_PORT, etc.)');
  console.error('  2. Create config.json based on config.example.json');
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

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

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

    const blockedCommands = [
      'op', 'deop', 'gamemode', 'gm', 'give', 'tp', 'teleport',
      'ban', 'kick', 'stop', 'whitelist', 'kill', 'clear',
      'difficulty', 'gamerule', 'weather', 'time', 'setworldspawn',
      'save-all', 'save-off', 'save-on', 'reload', 'defaultgamemode'
    ];

    const commandMatch = message.match(/(?:fais|execute|lance|utilise)\s+la\s+commande\s+(.+)/i) ||
      message.match(/(?:bot|toi),?\s+(?:fais|execute|lance)\s+(.+)/i);

    if (commandMatch) {
      let command = commandMatch[1].trim();
      if (command.startsWith('/')) command = command.slice(1);
      const baseCommand = command.split(' ')[0].toLowerCase();

      if (blockedCommands.includes(baseCommand)) {
        bot.chat(`❌ Commande /${baseCommand} non autorisée.`);
        console.log(`🚫 Commande bloquée: /${command}`);
      } else {
        bot.chat(`/${command}`);
        console.log(`⚙️ Commande exécutée: /${command}`);
      }
      return;
    }

    const challengePatterns = [
      /[ée]cri(?:s|t|vez|ve)\s+(\S+)\s+dans\s+le\s+chat/i,
      /tape[z]?\s+(\S+)\s+dans\s+le\s+chat/i,
      /dis|dites\s+(\S+)\s+dans\s+le\s+chat/i,
      /envoi(?:e|ez)\s+(\S+)\s+dans\s+le\s+chat/i,
      /met[stez]*\s+(\S+)\s+dans\s+le\s+chat/i,
      /write\s+(\S+)\s+in\s+(?:the\s+)?chat/i,
      /premier\s+[àa]\s+[ée]crire\s+(\S+)/i,
      /qui\s+[ée]cri[t]?\s+(\S+)\s+en\s+premier/i,
      /[ée]cri(?:s|t|vez|ve)\s+(\S+)(?:\s|$)/i
    ];

    for (const pattern of challengePatterns) {
      const challengeMatch = message.match(pattern);
      if (challengeMatch) {
        const word = challengeMatch[1];
        bot.chat(word);
        console.log(`🏆 Défi détecté ! Réponse envoyée: ${word}`);
        break;
      }
    }
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
  
  console.log('🔄 Reconnecting in 2 seconds...');
  setTimeout(() => {
    if (shouldReconnect) {
      console.log('🔌 Attempting to reconnect...');
      createBot();
    }
  }, 2000);
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

let lastActionIndex = -1;

function findNearbyMob() {
  return bot.nearestEntity(entity =>
    entity.type === 'mob' ||
    entity.type === 'hostile' ||
    entity.type === 'animal' ||
    entity.kind === 'Passive mobs' ||
    entity.kind === 'Hostile mobs'
  );
}

function performRandomAction() {
  const nearbyMob = findNearbyMob();

  if (nearbyMob) {
    randomAttackMob();
    return;
  }

  const actions = [
    () => randomLook(),
    () => randomJump(),
    () => randomMovement(),
    () => randomSneak(),
    () => randomBreakBlock(),
    () => randomPlaceBlock()
  ];

  let index;
  do {
    index = Math.floor(Math.random() * actions.length);
  } while (index === lastActionIndex && actions.length > 1);

  lastActionIndex = index;
  actions[index]();
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

async function randomBreakBlock() {
  try {
    const block = bot.findBlock({
      matching: (block) => block.type !== 0,
      maxDistance: 4
    });
    if (block) {
      await bot.dig(block);
      console.log('⛏️ Bloc cassé:', block.name);
    }
  } catch (err) {
    console.log('⚠️ Erreur cassage bloc:', err.message);
  }
}

async function randomPlaceBlock() {
  try {
    const item = bot.inventory.items().find(i =>
      i.name.includes('dirt') || i.name.includes('cobblestone') || i.name.includes('_block')
    );
    if (item) {
      const refBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      await bot.equip(item, 'hand');
      await bot.placeBlock(refBlock, { x: 0, y: 1, z: 0 });
      console.log('🧱 Bloc posé:', item.name);
    }
  } catch (err) {
    console.log('⚠️ Erreur pose bloc:', err.message);
  }
}

function randomAttackMob() {
  try {
    const mob = findNearbyMob();
    if (mob) {
      bot.pvp.attack(mob);
      console.log('⚔️ Attaque de:', mob.name || mob.displayName);
    }
  } catch (err) {
    console.log('⚠️ Erreur attaque:', err.message);
  }
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
console.log('🔐 Auth: ' + config.auth);
console.log('🔄 Auto-reconnect: Enabled');
console.log('♻️ Auto-respawn: Enabled');
console.log('\nPress Ctrl+C to stop the bot\n');

createBot();

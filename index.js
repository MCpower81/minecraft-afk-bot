const mineflayer = require('mineflayer');
require('dotenv').config();
const { loadConfig } = require('./config');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, goals } = require('mineflayer-pathfinder');

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

  const blockedCommands = [
    'op', 'deop', 'gamemode', 'gm', 'give', 'tp', 'teleport',
    'ban', 'kick', 'stop', 'whitelist', 'kill', 'clear',
    'difficulty', 'gamerule', 'weather', 'time', 'setworldspawn',
    'save-all', 'save-off', 'save-on', 'reload', 'defaultgamemode'
  ];

  function findPlayerByName(name) {
    const player = Object.values(bot.players).find(
      p => p.username.toLowerCase() === name.toLowerCase()
    );
    return player ? player.entity : null;
  }

  function commandCome(username) {
    const target = findPlayerByName(username);
    if (!target) {
      console.log(`⚠️ Joueur "${username}" introuvable pour venir vers lui`);
      return;
    }
    try {
      const goal = new goals.GoalNear(target.position.x, target.position.y, target.position.z, 1);
      bot.pathfinder.setGoal(goal);
      console.log(`🏃 Le bot vient vers ${username}`);
    } catch (err) {
      bot.lookAt(target.position);
      console.log(`⚠️ Pathfinding indisponible, le bot regarde ${username} à la place`);
    }
  }

  function commandStop() {
    stopAFKActions();
    try { bot.pathfinder.setGoal(null); } catch (e) {}
    bot.clearControlStates();
    console.log('🛑 Bot arrêté sur demande');
  }

  function commandResume() {
    if (!isRunning) startAFKActions();
    console.log('▶️ Bot relancé sur demande');
  }

  function commandDance() {
    let count = 0;
    const danceInterval = setInterval(() => {
      randomJump();
      bot.look(Math.random() * Math.PI * 2, 0);
      count++;
      if (count >= 6) clearInterval(danceInterval);
    }, 400);
    console.log('💃 Le bot danse');
  }

  function commandFlee() {
    const mob = findNearbyMob();
    if (!mob) {
      console.log('⚠️ Aucun danger détecté, rien à fuir');
      return;
    }
    const dx = bot.entity.position.x - mob.position.x;
    const dz = bot.entity.position.z - mob.position.z;
    const yaw = Math.atan2(-dx, -dz);
    bot.look(yaw, 0);
    bot.setControlState('forward', true);
    setTimeout(() => bot.setControlState('forward', false), 2000);
    console.log('🏃‍♂️ Le bot fuit');
  }

  function commandLookAt(username) {
    const target = findPlayerByName(username);
    if (target) {
      bot.lookAt(target.position.offset(0, 1.6, 0));
      console.log(`👁️ Le bot regarde ${username}`);
    } else {
      console.log(`⚠️ Joueur "${username}" introuvable`);
    }
  }

  function commandCircle() {
    let angle = 0;
    const circleInterval = setInterval(() => {
      bot.look(angle, 0);
      angle += Math.PI / 4;
      if (angle >= Math.PI * 2) clearInterval(circleInterval);
    }, 200);
    console.log('🔄 Le bot tourne en rond');
  }

  function handleCustomCommand(username, message) {
    const lower = message.toLowerCase();

    if (/(viens|rejoins[- ]moi|va vers moi|come here|come to me)/.test(lower)) {
      commandCome(username);
      return true;
    }
    if (/(arr[êe]te[- ]toi|stop bot|stoppe|pause)/.test(lower)) {
      commandStop();
      return true;
    }
    if (/(reprends|relance|continue|resume)/.test(lower)) {
      commandResume();
      return true;
    }
    if (/(danse|dance)/.test(lower)) {
      commandDance();
      return true;
    }
    if (/(fuis|fuit|enfuis[- ]toi|run away|flee)/.test(lower)) {
      commandFlee();
      return true;
    }
    if (/(regarde moi|look at me|regarde-moi)/.test(lower)) {
      commandLookAt(username);
      return true;
    }
    const lookAtMatch = lower.match(/regarde\s+(\w+)/);
    if (lookAtMatch && lookAtMatch[1] !== 'moi') {
      commandLookAt(lookAtMatch[1]);
      return true;
    }
    if (/(tourne en rond|fais un tour|spin|circle)/.test(lower)) {
      commandCircle();
      return true;
    }
    if (/(saute|jump)/.test(lower) && !/dans le chat/.test(lower)) {
      randomJump();
      return true;
    }
    if (/(accroupis[- ]toi|sneak|cache[- ]toi)/.test(lower)) {
      randomSneak();
      return true;
    }
    if (/(casse un bloc|break block|mine)/.test(lower)) {
      randomBreakBlock();
      return true;
    }
    if (/(pose un bloc|place block|construis)/.test(lower)) {
      randomPlaceBlock();
      return true;
    }
    if (/(attaque|attack|frappe)/.test(lower)) {
      randomAttackMob();
      return true;
    }

    const sayMatch = message.match(/(?:dis|say|répète)\s+["']?(.+?)["']?$/i);
    if (sayMatch && !/dans le chat/.test(lower)) {
      bot.chat(sayMatch[1]);
      console.log(`🗣️ Le bot répète: ${sayMatch[1]}`);
      return true;
    }

    return false;
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`💬 ${username}: ${message}`);

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

    if (handleCustomCommand(username, message)) {
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

  bot.on('message', (jsonMsg) => {
    try {
      const extra = jsonMsg.json?.extra || jsonMsg.extra || [];
      const parts = Array.isArray(extra) ? extra : [jsonMsg.json || jsonMsg];

      for (const part of parts) {
        if (part?.clickEvent) {
          const { action, value } = part.clickEvent;
          console.log(`🖱️ Bouton détecté (${action}): ${value}`);

          if (action === 'run_command' || action === 'suggest_command') {
            let command = value.startsWith('/') ? value.slice(1) : value;
            const baseCommand = command.split(' ')[0].toLowerCase();

            if (blockedCommands.includes(baseCommand)) {
              console.log(`🚫 Bouton bloqué (commande interdite): /${command}`);
            } else {
              bot.chat(`/${command}`);
              console.log(`✅ Bouton "cliqué": /${command}`);
            }
          } else if (action === 'open_url') {
            console.log(`🔗 Lien détecté (non cliquable par un bot): ${value}`);
          }
        }
      }
    } catch (err) {
      console.log('⚠️ Erreur détection bouton:', err.message);
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
    stopAFKActions();
    reconnect();
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
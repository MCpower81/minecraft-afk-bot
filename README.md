# Minecraft AFK Bot

A simple bot that connects to Minecraft servers and performs random actions to prevent being kicked for inactivity.

## Features

- 🤖 Random AFK actions (walking, jumping, looking, sneaking)
- ⚙️ Configurable server settings
- 📊 Real-time action logging
- 🔄 Auto-reconnect on disconnect
- 🎮 Support for multiple Minecraft versions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Edit `config.json` with your server details:
```json
{
  "host": "your-server-ip.com",
  "port": 25565,
  "username": "BotAFK",
  "version": "1.20.1",
  "auth": "offline"
}
```

3. Run the bot:
```bash
node index.js
```

4. Stop the bot by pressing `Ctrl+C`

## Configuration

- **host**: Minecraft server IP address
- **port**: Server port (default: 25565)
- **username**: Bot's username
- **version**: Minecraft version (e.g., "1.20.1", "1.19.4")
- **auth**: Authentication method ("offline" for cracked servers, "microsoft" for official)

## Random Actions

The bot performs these actions at random intervals:
- 👀 Looking around (random yaw/pitch)
- 🦘 Jumping
- 🚶 Moving (forward, back, left, right)
- 🤫 Sneaking

Actions occur every 3-8 seconds with randomized timing to appear more natural.

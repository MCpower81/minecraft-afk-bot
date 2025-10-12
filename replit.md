# Minecraft AFK Bot

## Overview
A Minecraft AFK bot built with Node.js and Mineflayer that connects to servers and performs random actions to prevent inactivity kicks.

## Recent Changes
- **October 12, 2025**: Initial project setup
  - Installed Node.js 20 and Mineflayer library
  - Created bot with random AFK actions (movement, jumping, looking, sneaking)
  - Configured server connection settings
  - Added command-line interface with Ctrl+C shutdown
  - Improved timing with recursive setTimeout for more natural behavior

## Project Architecture
- **Language**: Node.js 20
- **Main Library**: Mineflayer (Minecraft bot framework)
- **Structure**:
  - `index.js`: Main bot logic with random action system
  - `config.json`: Server connection settings
  - `config.example.json`: Template for configuration
  - `README.md`: Usage documentation

## Features
- Random AFK actions every 3-8 seconds
- Support for multiple Minecraft versions
- Console logging with emojis
- Graceful shutdown handling
- Error handling and auto-cleanup
- Natural timing with randomized intervals

## User Preferences
- Project type: Minecraft bot
- Action style: Random (walking, jumping, looking, sneaking)
- Server type: Configurable (supports offline and authenticated servers)

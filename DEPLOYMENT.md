# Guide de Déploiement Northflank

Ce guide vous explique comment déployer votre bot Minecraft AFK sur Northflank pour qu'il reste actif 24/7 **gratuitement**.

## 📋 Prérequis

1. Un compte GitHub (pour héberger votre code)
2. Un compte Northflank gratuit : https://northflank.com

## 🚀 Étapes de Déploiement

### 1. Préparer votre Repository GitHub

1. Créez un nouveau repository sur GitHub
2. Poussez ce projet sur votre repository :
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git push -u origin main
```

### 2. Créer un Projet sur Northflank

1. Connectez-vous à Northflank : https://app.northflank.com
2. Cliquez sur **"Create Project"**
3. Donnez un nom à votre projet (ex: "minecraft-afk-bot")
4. Cliquez sur **"Create"**

### 3. Déployer le Bot

1. Dans votre projet, cliquez sur **"Create Service"**
2. Sélectionnez **"Combined"** (Build & Deploy)
3. Choisissez **"Git Repository"**
4. Connectez votre compte GitHub et sélectionnez votre repository
5. Configurez le déploiement :
   - **Branch** : `main`
   - **Build** : Northflank détectera automatiquement Node.js
   - **Port** : Laissez vide (pas de serveur web)

### 4. Configurer les Variables d'Environnement

Dans l'onglet **"Environment Variables"**, ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `MC_HOST` | `Astralcrafteur.aternos.me` | Adresse de votre serveur Minecraft |
| `MC_PORT` | `24990` | Port du serveur |
| `MC_USERNAME` | `BotAFK` | Nom du bot |
| `MC_VERSION` | `1.21.5` | Version Minecraft |
| `MC_AUTH` | `offline` | Type d'authentification |

**Important** : Remplacez les valeurs par celles de votre serveur !

### 5. Démarrer le Bot

1. Cliquez sur **"Deploy"**
2. Northflank va :
   - Cloner votre repository
   - Installer les dépendances (`npm install`)
   - Démarrer le bot (`npm start`)

### 6. Vérifier le Fonctionnement

1. Allez dans l'onglet **"Logs"** de votre service
2. Vous devriez voir :
   ```
   🚀 Starting Minecraft AFK Bot...
   📋 Server: Astralcrafteur.aternos.me:24990
   👤 Username: BotAFK
   ✅ Bot logged in as BotAFK
   🎮 Bot spawned in the world
   ```

## ✅ C'est Terminé !

Votre bot est maintenant actif 24/7 gratuitement sur Northflank ! 🎉

### Modifier la Configuration

Pour changer les paramètres du serveur :
1. Allez dans **"Environment Variables"**
2. Modifiez les valeurs
3. Le service redémarrera automatiquement

### Arrêter le Bot

Pour arrêter temporairement :
1. Allez dans **"Service Settings"**
2. Cliquez sur **"Pause Service"**

### Mettre à Jour le Code

Quand vous modifiez votre code :
1. Poussez vos changements sur GitHub
2. Northflank redéploiera automatiquement

## 🆘 Dépannage

**Le bot ne se connecte pas ?**
- Vérifiez que votre serveur Aternos est en ligne
- Vérifiez les variables d'environnement (IP, port, version)

**Le service ne démarre pas ?**
- Consultez les logs pour voir l'erreur
- Vérifiez que `package.json` contient `"start": "node index.js"`

**Besoin d'aide ?**
- Documentation Northflank : https://northflank.com/docs
- Logs du service sur Northflank

## 💰 Coût

**100% GRATUIT** avec le tier gratuit de Northflank !
- Pas de carte de crédit requise
- Pas de limitation de temps
- Déploiement 24/7 inclus

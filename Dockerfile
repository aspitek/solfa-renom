# Utiliser une image Node.js officielle comme base
FROM node:23-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et installer les dépendances
COPY package.json ./
RUN npm install

# Copier tous les fichiers du projet
COPY . .

# Assurer que le dossier backend est bien copié (redondant mais explicite)
COPY backend/ ./backend/

# Exposer le port utilisé par le serveur
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "backend/server.js"]
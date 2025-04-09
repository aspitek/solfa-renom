const express = require('express');
const cors = require('cors');
const driveManager = require('./drive.js');

const app = express();
const PORT = 3000;

// Configuration CORS spécifique
const corsOptions = {
    origin: '*', // Remplace par l'URL de ton frontend
    methods: ['GET', 'POST'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type'], // En-têtes autorisés
    credentials: true // Si tu utilises des cookies/sessions
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.'));
// Endpoint pour lister les fichiers
app.get('/api/files', async (req, res) => {
    try {
        const files = await driveManager.listFiles();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
    }
});

// Endpoint pour renommer un fichier
app.post('/api/rename', async (req, res) => {
    const { fileId, newName } = req.body;
    if (!fileId || !newName) {
        return res.status(400).json({ error: 'fileId et newName requis' });
    }

    try {
        const updatedFile = await driveManager.renameFile(fileId, newName);
        res.json({ success: true, file: updatedFile });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du renommage' });
    }
});

app.get('/api/download/:fileId', async (req, res) => {
    const { fileId } = req.params;
    try {
        const fileData = await driveManager.downloadFile(fileId);
        res.set('Content-Type', 'application/pdf');
        res.send(Buffer.from(fileData)); // Envoie le fichier brut
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
    }
});

// Servir les fichiers statiques du frontend
app.use(express.static('../')); // Ajuste le chemin selon ta structure

app.listen(PORT, () => {
    console.log(`Serveur démarré sur :${PORT}`);
});
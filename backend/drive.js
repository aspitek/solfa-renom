const { google } = require('googleapis');
const path = require('path');

folder_jmc = "1hJedWz62erjgQBCH2GdTVfBXqmfEN9vY"
folder_test = "1qDYNiGyjgi0xL6UljzLJsSKd6CdVO9J3"

class DriveManager {
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, './config/google-auth.json'),
            scopes: ['https://www.googleapis.com/auth/drive']
        });
        this.drive = google.drive({ version: 'v3', auth: this.auth });
        this.folderId = folder_jmc; // ID du dossier
    }

    async listFiles() {
        const pattern = /^[^_]+_[^_]+_[^_]+_[^_]+(_\d{4}(-\d{2}(-\d{2})?)?)?$/;
        try {
            const res = await this.drive.files.list({
                q: `'${this.folderId}' in parents`,
                fields: 'files(id, name, webViewLink)',
                spaces: 'drive'
            });
            
            console.log('Files:', res.data.files);

            const files = res.data.files || [];
            return files
            .filter(file => !pattern.test(file.name.replace(/\.pdf$/i, ''))) // Filtrer les fichiers selon le pattern
                .map(file => ({
                    id: file.id,
                    name: file.name,
                    url: file.webViewLink
                }));
        } catch (error) {
            console.error('Erreur listFiles:', error);
            throw error;
        }
    }

    async renameFile(fileId, newName) {
        try {
            const res = await this.drive.files.update({
                fileId,
                requestBody: { name: `${newName}.pdf` }
            });
            return res.data;
        } catch (error) {
            console.error('Erreur renameFile:', error);
            throw error;
        }
    }

    // Nouvelle méthode pour télécharger le fichier
    async downloadFile(fileId) {
        try {
            const res = await this.drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'arraybuffer' } // Récupère le contenu brut
            );
            return res.data; // Retourne les données binaires du PDF
        } catch (error) {
            console.error('Erreur downloadFile:', error);
            throw error;
        }
    }
}

module.exports = new DriveManager();
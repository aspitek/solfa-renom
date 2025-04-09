class PDFRenamer {
    constructor() {
        this.files = [];
        this.currentIndex = 0;
        this.pattern = /^[^_]+_[^_]+_[^_]+_[^_]+(_\d{4}(-\d{2}(-\d{2})?)?)?$/; // Pattern regex corrigé
        
        this.preview = document.getElementById('pdf-viewer');
        this.currentFileSpan = document.getElementById('current-file');
        this.newNameInput = document.getElementById('new-name');
        this.renameBtn = document.getElementById('rename-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.progress = document.getElementById('progress');

        this.currentBlobUrl = null; // Pour stocker l'URL temporaire du fichier téléchargé

        this.initEventListeners();
        this.loadFiles();
    }

    initEventListeners() {
        this.renameBtn.addEventListener('click', () => this.renameFile());
        this.skipBtn.addEventListener('click', () => this.nextFile());
    }

    async loadFiles() {
        const response = await fetch('http://localhost:3000/api/files');
        this.files = await response.json();
        this.updateProgress();
        this.showCurrentFile();
    }

    async showCurrentFile() {
        if (this.currentIndex >= this.files.length) {
            alert('Tous les fichiers ont été traités !');
            return;
        }

        const currentFile = this.files[this.currentIndex];
        this.currentFileSpan.textContent = currentFile.name;

        // Télécharger le fichier
        const response = await fetch(`http://localhost:3000/api/download/${currentFile.id}`);
        const blob = await response.blob();
        
        // Créer une URL temporaire pour afficher le PDF
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl); // Libérer l'ancienne URL
        }
        this.currentBlobUrl = URL.createObjectURL(blob);
        this.preview.src = this.currentBlobUrl;

        this.newNameInput.value = '';
        this.newNameInput.placeholder = 'Titre_Auteur_Genre_Catégorie(_date)';
    }

    async renameFile() {
        const newName = this.newNameInput.value.trim();
        if (!newName) return;

        const currentFile = this.files[this.currentIndex];

        // Renommer sur Google Drive
        await fetch('http://localhost:3000/api/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileId: currentFile.id,
                newName: newName // Sans ".pdf", ajouté côté backend
            })
        });

        // Supprimer localement l'URL temporaire
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }

        this.nextFile();
    }

    nextFile() {
        this.currentIndex++;
        this.updateProgress();
        this.showCurrentFile();
    }

    updateProgress() {
        this.progress.textContent = `${this.currentIndex}/${this.files.length}`;
    }
}


document.addEventListener('DOMContentLoaded', () => new PDFRenamer());
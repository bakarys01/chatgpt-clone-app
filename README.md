# 🤖 ChatGPT Clone - Version Complète 2025

Un clone complet de ChatGPT avec toutes les fonctionnalités 2025, construit avec Next.js 14, TypeScript et les dernières API OpenAI.

## ✨ Fonctionnalités

### 🧠 **Modèles IA 2025**
- **GPT-5** - Modèle phare avec raisonnement avancé
- **Série o3** - o3, o3-pro, o4-mini pour le raisonnement complexe
- **Famille GPT-4.1** - GPT-4.1, 4.1-mini, 4.1-nano avec 1M tokens de contexte
- **GPT-4o** - Capacités multimodales intégrées
- **Auto-détection** - Sélection automatique du bon endpoint API

### 💬 **Chat Avancé**
- **Streaming en temps réel** des réponses
- **Gestion multi-conversations** avec métadonnées
- **Renommage automatique** des conversations
- **Mémoire inter-conversations** - préférences et contexte persistants
- **Rendu Markdown** avec support des liens et formatage

### 📁 **RAG et Fichiers**
- **Upload multi-formats** : PDF, images, texte, JSON
- **Extraction automatique** du contenu avec OCR
- **Traitement en temps réel** avec indicateurs de progression
- **Intégration transparente** - les fichiers sont automatiquement analysés
- **Sources sélectionnables** dans l'onglet Sources

### 🌐 **Navigation Web**
- **Recherche en temps réel** avec DuckDuckGo
- **Extraction de contenu** depuis les URLs
- **Détection automatique** des requêtes de recherche
- **Citations sources** avec liens cliquables
- **Résumés intelligents** générés par GPT-4

### 🎨 **Génération d'Images**
- **DALL-E 3** intégré avec contrôles avancés
- **Options complètes** : taille, qualité, style
- **Galerie d'images** avec téléchargement et partage
- **Envoi vers chat** pour analyse d'images

### 📝 **Canvas (Éditeur)**
- **Éditeur split-screen** avec prévisualisation en direct
- **Multi-formats** : Document, Code, HTML
- **Gestion des documents** : sauvegarde, chargement, export
- **Coloration syntaxique** et rendu HTML en temps réel

### 🎤 **Fonctionnalités Vocales**
- **Speech-to-Text** avec Whisper OpenAI
- **Text-to-Speech** avec 6 voix disponibles
- **Visualisation audio** en temps réel
- **Export audio** en MP3

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone [url-du-repo]
cd chatgpt-clone-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
```bash
cp .env.example .env.local
# Éditez .env.local et ajoutez votre clé API OpenAI
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir l'application**
Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Clé API OpenAI
1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Générez une clé API dans la section API Keys
3. Ajoutez-la dans `.env.local` :
```env
OPENAI_API_KEY=sk-votre-cle-api-ici
```

## 📖 Guide d'utilisation

### 💬 Chat Basique
- Sélectionnez un modèle dans la barre latérale
- Tapez votre message et appuyez sur Entrée
- Les réponses sont streamées en temps réel

### 📎 Utilisation de Fichiers
1. Cliquez sur l'icône 📎 pour joindre un fichier
2. Attendez que le fichier soit traité (indicateur ✅)
3. Écrivez votre message référençant le fichier
4. L'IA analysera automatiquement le contenu

### 🔍 Recherche Web
- Utilisez des phrases comme "rechercher les dernières news IA"
- Ou collez directement une URL
- Les résultats sont automatiquement résumés

### 📄 Sources RAG
1. Allez dans l'onglet "Sources"
2. Uploadez des documents ou effectuez une recherche web
3. Sélectionnez les sources à inclure
4. Retournez au chat - les sources sont automatiquement utilisées

### 🎨 Génération d'Images
1. Onglet "Images"
2. Décrivez l'image souhaitée
3. Ajustez les paramètres (taille, style, qualité)
4. Cliquez "Générer"

### 📝 Canvas
1. Onglet "Canvas"
2. Choisissez le type de document
3. Éditez dans le panneau gauche
4. Voyez la prévisualisation à droite
5. Sauvegardez et exportez

### 🎤 Fonctions Vocales
- **Entrée vocale** : Cliquez sur 🎤 pour enregistrer
- **Sortie vocale** : Cliquez ▶️ sur les réponses de l'IA
- **Téléchargement** : Cliquez 📥 pour sauvegarder l'audio

## 🛠️ Stack Technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Backend** : API Routes Next.js, Node.js runtime
- **IA** : OpenAI API (GPT-5, o3, DALL-E 3, Whisper, TTS)
- **Recherche** : DuckDuckGo Instant Answer API
- **Fichiers** : pdf-parse, file-saver
- **Audio** : Web Audio API, MediaRecorder

## 📱 Structure du Projet

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # Chat avec streaming
│   │   ├── image/          # Génération DALL-E
│   │   ├── browse/         # Navigation web
│   │   ├── upload/         # Upload multi-format
│   │   └── voice/          # Fonctions vocales
│   ├── globals.css         # Styles globaux
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil
└── components/
    ├── ChatApp.tsx         # Container principal
    ├── ChatInterface.tsx   # Interface de chat
    ├── ImageGenerator.tsx  # Génération d'images
    ├── Canvas.tsx          # Éditeur de documents
    ├── VoiceRecorder.tsx   # Enregistrement vocal
    ├── TextToSpeech.tsx    # Synthèse vocale
    └── SourceManager.tsx   # Gestion des sources RAG
```

## 🐛 Résolution de problèmes

### Fichiers non traités
- Vérifiez que votre clé API OpenAI est valide
- Assurez-vous que le fichier est dans un format supporté
- Vérifiez la console pour les erreurs

### Recherche web qui ne fonctionne pas
- Vérifiez votre connexion internet
- L'API DuckDuckGo peut avoir des limites de taux

### Problèmes de compilation
```bash
# Nettoyez le cache
rm -rf .next
npm run dev
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

**Note** : Ce projet nécessite une clé API OpenAI valide pour fonctionner. Les fonctionnalités avancées comme o3 et GPT-5 peuvent nécessiter un accès bêta.
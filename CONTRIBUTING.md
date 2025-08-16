# 🤝 Guide de Contribution - ChatGPT Clone

## 📋 Structure des Branches

### 🌿 Branches Principales
- **`main`** - Version stable de production
- **`development`** - Branche de développement principal

### 🔧 Branches de Fonctionnalités
- **`feature/ui-improvements`** - Améliorations de l'interface utilisateur
- **`feature/api-enhancements`** - Améliorations des APIs et backend
- **`feature/new-components`** - Nouveaux composants React
- **`hotfix/critical-fixes`** - Correctifs critiques urgents

## 🚀 Workflow de Développement

### 1. Pour une Nouvelle Fonctionnalité
```bash
# Créer une branche depuis development
git checkout development
git pull origin development
git checkout -b feature/nom-de-la-fonctionnalite

# Développer la fonctionnalité
# Faire des commits atomiques

# Pousser et créer une Pull Request
git push -u origin feature/nom-de-la-fonctionnalite
```

### 2. Pour un Correctif Urgent
```bash
# Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b hotfix/nom-du-correctif

# Corriger le problème
# Faire un commit avec un message clair

# Pousser et créer une Pull Request vers main
git push -u origin hotfix/nom-du-correctif
```

## 📝 Convention de Commits

Utilisez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: Ajouter une nouvelle fonctionnalité
fix: Corriger un bug
docs: Mise à jour de la documentation
style: Changements de style (formatage, etc.)
refactor: Refactorisation du code
test: Ajouter ou modifier des tests
chore: Maintenance générale
```

### Exemples :
```bash
git commit -m "feat: Add voice message recording feature"
git commit -m "fix: Resolve text visibility in chat input"
git commit -m "docs: Update API documentation"
```

## 🔄 Pull Requests

### Checklist avant PR
- [ ] Code testé localement
- [ ] Tests passent (`npm test`)
- [ ] Build réussit (`npm run build`)
- [ ] Lint passé (`npm run lint`)
- [ ] Documentation mise à jour si nécessaire

### Template de PR
```markdown
## 📝 Description
Brève description des changements

## 🔧 Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## ✅ Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests manuels effectués
- [ ] Build réussit

## 📷 Captures d'écran (si applicable)

## 📋 Notes supplémentaires
```

## 🛠️ Développement Local

### Installation
```bash
npm install
cp .env.example .env.local
# Ajouter votre clé API OpenAI dans .env.local
```

### Commandes Utiles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification du code
npm run type-check   # Vérification TypeScript
```

## 📚 Stack Technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Backend** : API Routes Next.js
- **IA** : OpenAI API (GPT-4o, DALL-E 3, Whisper, TTS)
- **Déploiement** : Vercel

## 🎨 Standards de Code

- Utiliser TypeScript strictement
- Suivre les conventions ESLint configurées
- Utiliser les classes CSS définies dans `globals.css`
- Composants fonctionnels avec hooks React
- Props typées avec des interfaces TypeScript

## 🔒 Sécurité

- ❌ Ne jamais committer de clés API
- ❌ Ne jamais exposer de variables sensibles
- ✅ Utiliser `.env.local` pour les secrets
- ✅ Valider toutes les entrées utilisateur

## 🤖 Assistance IA

Ce projet utilise [Claude Code](https://claude.ai/code) pour l'assistance au développement. Les commits générés avec l'IA incluent la signature :

```
🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 📞 Support

Pour toute question :
1. Créer une issue GitHub
2. Consulter la documentation dans `/docs`
3. Vérifier les discussions existantes

---
**Merci de contribuer au projet ! 🚀**
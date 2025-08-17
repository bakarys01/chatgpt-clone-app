# Test de Coloration Syntaxique

## JavaScript
```javascript
// Fonction pour calculer la somme
function calculateSum(numbers) {
  let total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total;
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(`Total: ${result}`);
```

## Python
```python
# Classe pour gérer une liste de tâches
class TaskManager:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, task):
        """Ajouter une nouvelle tâche"""
        self.tasks.append({
            'id': len(self.tasks) + 1,
            'description': task,
            'completed': False
        })
    
    def complete_task(self, task_id):
        for task in self.tasks:
            if task['id'] == task_id:
                task['completed'] = True
                break

# Utilisation
manager = TaskManager()
manager.add_task("Apprendre Python")
print(f"Nombre de tâches: {len(manager.tasks)}")
```

## TypeScript
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];

  addUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}

const userService = new UserService();
const user = userService.addUser({
  name: "John Doe",
  email: "john@example.com",
  isActive: true
});
```

## CSS
```css
/* Variables CSS pour le thème */
:root {
  --primary-color: #10b981;
  --secondary-color: #374151;
  --background: #ffffff;
  --text-color: #1f2937;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background);
  color: var(--text-color);
}

.message-bubble {
  background: linear-gradient(135deg, var(--primary-color), #059669);
  border-radius: 18px;
  padding: 12px 16px;
  margin: 8px 0;
  max-width: 70%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## HTML
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChatGPT Clone</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app" class="chat-container">
    <header class="chat-header">
      <h1>ChatGPT Clone</h1>
      <button class="settings-btn" onclick="openSettings()">
        ⚙️ Paramètres
      </button>
    </header>
    
    <main class="chat-messages" id="messages">
      <!-- Messages seront insérés ici -->
    </main>
    
    <footer class="chat-input">
      <input type="text" placeholder="Tapez votre message..." />
      <button onclick="sendMessage()">Envoyer</button>
    </footer>
  </div>
  
  <script src="script.js"></script>
</body>
</html>
```

## Bash
```bash
#!/bin/bash

# Script de déploiement automatique
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
PROJECT_NAME="chatgpt-clone"
BUILD_DIR="dist"
SERVER_HOST="production.example.com"

# Fonction de nettoyage
cleanup() {
  echo "🧹 Nettoyage des fichiers temporaires..."
  rm -rf temp/
}

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --production

# Build du projet
echo "🔨 Build du projet..."
npm run build

# Tests
echo "🧪 Exécution des tests..."
npm test

# Déploiement
echo "📤 Déploiement vers $SERVER_HOST..."
rsync -avz --delete $BUILD_DIR/ user@$SERVER_HOST:/var/www/$PROJECT_NAME/

echo "✅ Déploiement terminé avec succès!"
cleanup
```

## SQL
```sql
-- Création de la base de données pour le chat
CREATE DATABASE chatgpt_clone;
USE chatgpt_clone;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Table des conversations
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200),
    model_used VARCHAR(50) DEFAULT 'gpt-4o',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Requête pour récupérer les dernières conversations
SELECT 
    c.id,
    c.title,
    c.model_used,
    c.updated_at,
    COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.user_id = ?
GROUP BY c.id
ORDER BY c.updated_at DESC
LIMIT 10;
```
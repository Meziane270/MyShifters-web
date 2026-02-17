# MyShifters - Plateforme de gestion de shifts hôteliers

## 🏗️ Architecture

- **Backend** : FastAPI + MongoDB (Motor) + JWT
- **Frontend** : React + TailwindCSS + shadcn/ui
- **Base de données** : MongoDB Atlas

## 📋 Prérequis

- Python 3.11+
- Node.js 22+ et Yarn
- Compte MongoDB Atlas (ou MongoDB local)

## 🚀 Installation

### 1. Backend

```bash
cd backend
sudo pip3 install -r requirements.txt
```

### 2. Frontend

```bash
cd frontend
yarn install
```

## ⚙️ Configuration

### Backend

Le fichier `.env` contient la configuration de production (Render + Netlify).

Pour le développement local, un fichier `.env.local` a été créé avec :
```env
NODE_ENV=development
PORT=8000
```

Les autres variables (MongoDB, JWT) sont héritées du fichier `.env`.

### Frontend

Le fichier `.env` pointe vers le backend de production (Render).

Pour le développement local, un fichier `.env.local` a été créé avec :
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:8000/api
```

## 🎯 Démarrage

### Méthode 1 : Scripts automatiques

**Backend** :
```bash
cd backend
./start.sh
```

**Frontend** (dans un autre terminal) :
```bash
cd frontend
./start.sh
```

### Méthode 2 : Commandes manuelles

**Backend** :
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** :
```bash
cd frontend
yarn start
```

## 🌐 Accès

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

## 🔐 Sécurité

⚠️ **IMPORTANT** : Le fichier `.env` contient des secrets sensibles (credentials MongoDB, JWT secret).

**Ne JAMAIS committer le fichier `.env` dans Git !**

Un fichier `.gitignore` a été créé pour éviter cela.

### Recommandations :

1. **Régénérer les secrets** :
   - Créer un nouveau secret JWT
   - Créer un nouvel utilisateur MongoDB avec des credentials uniques

2. **Utiliser des variables d'environnement** en production :
   - Sur Render : configurer les variables dans le dashboard
   - Sur Netlify : configurer les variables dans les paramètres du site

3. **Ne jamais exposer les secrets** dans le code source

## 📁 Structure du projet

```
myshifters-app-final/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dépendances Python
│   ├── .env              # Config production (NE PAS COMMITTER)
│   ├── .env.local        # Config locale
│   └── start.sh          # Script de démarrage
├── frontend/
│   ├── src/
│   │   ├── pages/        # Pages React
│   │   ├── components/   # Composants UI
│   │   ├── context/      # Contextes (Auth, etc.)
│   │   └── hooks/        # Hooks personnalisés
│   ├── package.json      # Dépendances Node.js
│   ├── .env             # Config production (NE PAS COMMITTER)
│   ├── .env.local       # Config locale
│   └── start.sh         # Script de démarrage
└── README.md            # Ce fichier
```

## 🐛 Problèmes corrigés

1. ✅ Dépendances Python manquantes → Installées
2. ✅ Dépendances Node.js manquantes → Installées
3. ✅ Configuration URLs pour développement local → `.env.local` créés
4. ✅ Port 3000 bloqué → Libéré
5. ✅ Cohérence des extensions de fichiers → `AuthContext.js` → `AuthContext.jsx`
6. ✅ Sécurité → `.gitignore` créé

## 📝 Notes

### Développement local vs Production

- **Local** : Utilise `.env.local` (backend sur port 8000, frontend sur 3000)
- **Production** : Utilise `.env` (backend sur Render, frontend sur Netlify)

### CORS

Le backend accepte les requêtes de :
- `https://myshiftersapp.netlify.app` (production)
- `http://localhost:3000` (développement)

Si vous changez le port du frontend, ajoutez-le dans `CORS_ORIGINS` du fichier `.env`.

### Base de données

L'application utilise MongoDB Atlas. La chaîne de connexion est dans le fichier `.env`.

**Collections principales** :
- `users` : Utilisateurs (hôtels, workers, admin)
- `shifts` : Shifts/missions
- `applications` : Candidatures aux shifts
- `reviews` : Avis
- `disputes` : Litiges
- `files` : Fichiers uploadés (documents, etc.)

## 🆘 Support

En cas de problème :

1. Vérifier que les dépendances sont installées
2. Vérifier que les ports 3000 et 8000 sont libres
3. Vérifier que MongoDB Atlas est accessible
4. Consulter les logs du backend et du frontend

## 📄 Licence

Propriétaire - MyShifters © 2024

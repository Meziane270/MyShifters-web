# MyShifters - Guide de Déploiement Complet

## 📋 Table des Matières
1. [Prérequis](#1-prérequis)
2. [Télécharger et Extraire le Code](#2-télécharger-et-extraire-le-code)
3. [Configurer la Base de Données MongoDB](#3-configurer-la-base-de-données-mongodb)
4. [Déployer le Backend](#4-déployer-le-backend)
5. [Déployer le Frontend](#5-déployer-le-frontend)
6. [Tester l'Application](#6-tester-lapplication)
7. [Dépannage](#7-dépannage)

---

## 1. Prérequis

Avant de commencer, vous aurez besoin de :

- **Un compte GitHub** → [github.com](https://github.com)
- **Un compte MongoDB Atlas** (gratuit) → [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Un compte Railway** (backend) → [railway.app](https://railway.app) OU **Render** → [render.com](https://render.com)
- **Un compte Vercel** (frontend) → [vercel.com](https://vercel.com) OU **Netlify** → [netlify.com](https://netlify.com)

---

## 2. Télécharger et Extraire le Code

### Étape 2.1 : Télécharger le ZIP
```bash
# Téléchargez le fichier ZIP
wget https://lodging-careers.preview.emergentagent.com/myshifters-app.zip

# OU téléchargez manuellement via votre navigateur
```

### Étape 2.2 : Extraire le ZIP
```bash
# Extraire le fichier
unzip myshifters-app.zip

# Entrer dans le dossier
cd myshifters-app
```

### Étape 2.3 : Pousser sur GitHub
```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - MyShifters"

# Créer un nouveau repo sur GitHub, puis :
git remote add origin https://github.com/VOTRE_USERNAME/myshifters.git
git branch -M main
git push -u origin main
```

---

## 3. Configurer la Base de Données MongoDB

### Étape 3.1 : Créer un compte MongoDB Atlas
1. Allez sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Cliquez sur **"Try Free"**
3. Créez un compte (ou connectez-vous avec Google)

### Étape 3.2 : Créer un Cluster
1. Cliquez sur **"Build a Database"**
2. Choisissez **"M0 FREE"** (gratuit)
3. Sélectionnez une région proche de vous (ex: Paris, Frankfurt)
4. Cliquez sur **"Create"**

### Étape 3.3 : Configurer l'accès
1. **Créer un utilisateur database** :
   - Username: `myshifters_user`
   - Password: (générez un mot de passe sécurisé, NOTEZ-LE)
   - Cliquez sur **"Create User"**

2. **Autoriser les connexions** :
   - Dans "Network Access", cliquez sur **"Add IP Address"**
   - Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Cliquez sur **"Confirm"**

### Étape 3.4 : Obtenir l'URL de connexion
1. Cliquez sur **"Connect"** sur votre cluster
2. Choisissez **"Connect your application"**
3. Copiez l'URL qui ressemble à :
```
mongodb+srv://myshifters_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. **IMPORTANT** : Remplacez `<password>` par votre vrai mot de passe

**Exemple final :**
```
mongodb+srv://myshifters_user:MonMotDePasse123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

## 4. Déployer le Backend

### Option A : Avec Railway (Recommandé)

#### Étape 4.1 : Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub

#### Étape 4.2 : Créer un nouveau projet
1. Cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Choisissez votre repo `myshifters`
4. **IMPORTANT** : Configurez le root directory sur `/backend`

#### Étape 4.3 : Configurer les variables d'environnement
Dans l'onglet **"Variables"**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `MONGO_URL` | `mongodb+srv://myshifters_user:VotreMotDePasse@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | `myshifters` |
| `JWT_SECRET` | `votre-cle-secrete-tres-longue-et-complexe-2024` |
| `CORS_ORIGINS` | `*` (temporaire, à modifier après) |

#### Étape 4.4 : Configurer le déploiement
Dans **"Settings"** :
- **Root Directory** : `/backend`
- **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Étape 4.5 : Déployer
1. Cliquez sur **"Deploy"**
2. Attendez que le déploiement soit terminé (2-3 minutes)
3. **Copiez l'URL générée** (ex: `https://myshifters-backend.up.railway.app`)

#### Étape 4.6 : Tester le backend
```bash
curl https://VOTRE-URL-RAILWAY.up.railway.app/api/
# Doit retourner : {"message":"MyShifters API","status":"running"}
```

---

### Option B : Avec Render

#### Étape 4.1 : Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub

#### Étape 4.2 : Créer un Web Service
1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repo GitHub
3. Configurez :
   - **Name** : `myshifters-backend`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Étape 4.3 : Variables d'environnement
Ajoutez les mêmes variables que pour Railway (voir Étape 4.3 ci-dessus)

#### Étape 4.4 : Déployer
Cliquez sur **"Create Web Service"** et attendez le déploiement.

---

## 5. Déployer le Frontend

### Option A : Avec Vercel (Recommandé)

#### Étape 5.1 : Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub

#### Étape 5.2 : Importer le projet
1. Cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repo `myshifters`
3. Configurez :
   - **Framework Preset** : `Create React App`
   - **Root Directory** : `frontend`

#### Étape 5.3 : Variables d'environnement
Ajoutez cette variable :

| Variable | Valeur |
|----------|--------|
| `REACT_APP_BACKEND_URL` | `https://VOTRE-URL-BACKEND` (l'URL de Railway/Render) |

**Exemple :**
```
REACT_APP_BACKEND_URL=https://myshifters-backend.up.railway.app
```

#### Étape 5.4 : Déployer
1. Cliquez sur **"Deploy"**
2. Attendez le déploiement (2-3 minutes)
3. Votre site est en ligne ! 🎉

---

### Option B : Avec Netlify

#### Étape 5.1 : Créer un compte Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous avec GitHub

#### Étape 5.2 : Nouveau site
1. Cliquez sur **"Add new site"** → **"Import an existing project"**
2. Choisissez GitHub et sélectionnez votre repo

#### Étape 5.3 : Configurer le build
- **Base directory** : `frontend`
- **Build command** : `yarn build`
- **Publish directory** : `frontend/build`

#### Étape 5.4 : Variables d'environnement
Dans **"Site settings"** → **"Environment variables"**, ajoutez :
```
REACT_APP_BACKEND_URL=https://VOTRE-URL-BACKEND
```

#### Étape 5.5 : Déployer
Cliquez sur **"Deploy site"**

---

## 6. Tester l'Application

### Étape 6.1 : Vérifier la page d'accueil
1. Ouvrez votre URL frontend (Vercel/Netlify)
2. Vous devriez voir la landing page MyShifters

### Étape 6.2 : Créer un compte Hôtel
1. Cliquez sur **"Commencer"**
2. Sélectionnez **"Je suis un Hôtel"**
3. Remplissez le formulaire :
   - Nom : Test Hotel
   - Email : hotel@test.com
   - Mot de passe : Test1234
   - Nom de l'hôtel : Grand Hotel Paris
   - Ville : Paris

### Étape 6.3 : Créer une mission
1. Dans le dashboard, cliquez sur **"Nouvelle mission"**
2. Remplissez les détails de la mission
3. Cliquez sur **"Créer la mission"**

### Étape 6.4 : Créer un compte Extra
1. Déconnectez-vous
2. Créez un compte **"Je suis un Extra"**
3. Sélectionnez vos compétences

### Étape 6.5 : Postuler à une mission
1. Dans le dashboard worker, allez sur **"Missions disponibles"**
2. Cliquez sur **"Postuler"** sur une mission
3. Envoyez votre candidature

---

## 7. Dépannage

### Erreur : "Failed to fetch" ou "Network Error"
**Cause** : L'URL du backend est incorrecte ou CORS non configuré

**Solution** :
1. Vérifiez que `REACT_APP_BACKEND_URL` est correct
2. Dans Railway/Render, ajoutez votre URL frontend dans `CORS_ORIGINS` :
```
CORS_ORIGINS=https://votre-site.vercel.app
```

### Erreur : "Invalid credentials"
**Cause** : L'utilisateur n'existe pas ou mot de passe incorrect

**Solution** : Créez un nouveau compte

### Erreur : MongoDB connection failed
**Cause** : URL MongoDB incorrecte ou IP non autorisée

**Solution** :
1. Vérifiez que `<password>` est remplacé par le vrai mot de passe
2. Dans MongoDB Atlas, autorisez 0.0.0.0/0 dans Network Access

### Le site affiche une page blanche
**Cause** : Erreur JavaScript

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs
3. Assurez-vous que `REACT_APP_BACKEND_URL` est défini

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Railway/Render/Vercel
2. Testez l'API directement avec curl
3. Vérifiez la console du navigateur

---

## 🎉 Félicitations !

Votre application MyShifters est maintenant en ligne !

**URLs de votre application :**
- Frontend : `https://votre-site.vercel.app`
- Backend API : `https://votre-backend.railway.app/api/`


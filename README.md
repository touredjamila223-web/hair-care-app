# 💁‍♀️ Hair Care Tracker - Cheveux Crépus

App de suivi de routines capillaires pour femmes aux cheveux crépus.

## ✨ Fonctionnalités

- 📊 **Dashboard** - Suivi de la progression vers vos objectifs
- 🧬 **Profil** - Type de cheveux, porosité, densité, objectifs
- 📋 **Programme** - 6 routines hebdomadaires spécialisées
- ➕ **Ajouter Libre** - Routines personnalisées
- ✂️ **Coupes** - Suivi des coupes de pointes
- 📅 **Calendrier** - Vue mensuelle des routines
- 📖 **Historique** - Journal complèt avec édition
- 🧠 **Apprendre** - 8 leçons éducatives
- 🧪 **DIY** - 30+ recettes naturelles

## 🎬 Animations

- Accordéons smooth (Learn + DIY)
- Cards fade-in progressives
- Calendrier pulse subtil
- Rating stars bounce
- Boutons transition hover
- Transitions fluides générales

## 💾 Stockage

Toutes les données sont sauvegardées en **localStorage** (sur votre appareil, pas de cloud).

---

## 🚀 DÉPLOIEMENT RAPIDE (5 min)

### **Option 1: Vercel (Recommandé - GRATUIT)**

1. **Créer compte Vercel:**
   - Va sur https://vercel.com
   - Clique "Sign up"
   - Connecte avec GitHub/GitLab/Bitbucket

2. **Créer repository GitHub:**
   - Va sur https://github.com/new
   - Nom: `hair-care-app`
   - Crée le repo

3. **Uploader les fichiers:**
   ```bash
   # Dans ton terminal
   git clone https://github.com/[TON_USER]/hair-care-app.git
   cd hair-care-app
   
   # Copie les fichiers:
   # - hair-app-final-complet.jsx → src/App.jsx
   # - package.json
   # - .gitignore
   # + crée public/index.html et src/index.js (voir plus bas)
   
   git add .
   git commit -m "Initial commit"
   git push
   ```

4. **Déployer sur Vercel:**
   - Va sur https://vercel.com/new
   - Clique "Import Git Repository"
   - Sélectionne `hair-care-app`
   - Clique "Deploy"
   - ✅ Done! Ton lien est généré automatiquement

### **Option 2: Netlify (Très simple)**

1. Va sur https://netlify.com
2. Connecte ton GitHub
3. Sélectionne le repo `hair-care-app`
4. Clique "Deploy"
5. ✅ C'est live!

---

## 📁 Structure des fichiers

```
hair-care-app/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx (hair-app-final-complet.jsx)
│   └── index.js
├── package.json
├── .gitignore
└── README.md
```

### **public/index.html**
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="App de suivi de routines capillaires pour cheveux crépus" />
    <title>Hair Care Tracker</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAFAF8; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### **src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🔗 Partager l'app

Une fois déployée:
- **Lien public:** `https://hair-care-app-[nom-aleatoire].vercel.app`
- Partage sur **TikTok** - lien cliquable dans ta bio
- Partage sur **Instagram** - dans les stories avec lien
- Partage sur **WhatsApp** - groupe communauté

---

## 🛠️ Développement local

```bash
# Installer dépendances
npm install

# Lancer le serveur local
npm start

# Aller sur http://localhost:3000
```

---

## 📱 Responsive

L'app fonctionne sur:
- ✅ Mobile (iOS/Android)
- ✅ Tablette
- ✅ Desktop

Optimisée pour **mobile first**!

---

## 💡 Tips

- Toutes les données sont en **localStorage** (stockage local)
- Changer d'apareil = nouvelles données
- Pas de compte utilisateur = pas de cloud
- Pour sauvegarder = exporter les données (à ajouter)

---

## 🎁 Futures améliorations possibles

- [ ] Photos avant/après
- [ ] Suggestions intelligentes
- [ ] Badges & gamification
- [ ] Partage de recettes
- [ ] Analytics avancées
- [ ] Synchronisation cloud

---

## 👩‍💻 Créatrice

App créée avec ❤️ pour les femmes aux cheveux crépus.

---

**Prête à partager? 🚀**

# PasseportTrack

Application web de suivi de production et de livraison des passeports — Republique du Congo.

Stack : Node.js / Express / Sequelize / MySQL / Socket.io (backend) — HTML5 / Bootstrap 5 / JS vanilla (frontend).

## 1. Installation locale

```bash
git clone <url-de-votre-repo>
cd passeporttrack
npm install
cp .env.example .env
```

Renseignez `.env` avec vos identifiants MySQL locaux, puis :

```bash
npm run seed   # cree les tables + comptes de demonstration + donnees d'exemple
npm run dev    # demarre le serveur avec nodemon sur http://localhost:5000
```

Comptes de demonstration (affiches aussi dans la console apres `npm run seed`) :

| Role | Email | Mot de passe |
|---|---|---|
| Super Administrateur | admin@passeporttrack.cg | Admin@2026 |
| Enrolement | enrolement@passeporttrack.cg | Enrol@2026 |
| Production | production@passeporttrack.cg | Prod@2026 |
| Produit | produit@passeporttrack.cg | Produit@2026 |
| Quarantaine | quarantaine@passeporttrack.cg | Quar@2026 |
| Reception et Plaintes | reception@passeporttrack.cg | Recept@2026 |

**Changez ces mots de passe avant toute mise en production.**

## 2. Publier le code sur GitHub

```bash
git init
git add .
git commit -m "PasseportTrack - version initiale"
git branch -M main
git remote add origin https://github.com/<votre-utilisateur>/passeporttrack.git
git push -u origin main
```

(Remplacez l'URL par celle de votre depot, cree au prealable sur github.com — bouton "New repository", sans cocher "Initialize with README" pour eviter un conflit.)

## 3. Mettre l'application en ligne (URL publique)

### Pourquoi pas Vercel pour ce projet ?
Vercel est concu pour des fonctions serverless de courte duree. Or PasseportTrack a besoin :
- d'un serveur Express qui reste actif en permanence (sessions, etc.)
- de connexions persistantes Socket.io (notifications temps reel)
- d'une base MySQL classique

Ces trois besoins ne sont pas couverts nativement par Vercel. **Render** (ou Railway) fait exactement ce qu'il faut, gratuitement pour commencer, et le code reste exactement le meme.

### Etapes sur Render (recommande)

1. Creez un compte sur https://render.com et connectez-le a votre GitHub.
2. **Base de donnees MySQL** : Render ne fournit pas MySQL gratuitement (seulement Postgres). Utilisez un service externe gratuit, par exemple :
   - https://railway.app (MySQL gratuit avec credits d'essai)
   - https://www.freesqldatabase.com
   - https://aiven.io (offre d'essai MySQL)
   Recuperez host, port, nom de la base, utilisateur, mot de passe.
3. Sur Render : **New +** → **Web Service** → selectionnez votre repo GitHub `passeporttrack`.
4. Render detecte `render.yaml` automatiquement (Build command : `npm install`, Start command : `npm start`).
5. Renseignez les variables d'environnement demandees (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) avec les informations de l'etape 2. `DB_SSL=true` est deja configure (necessaire pour la plupart des MySQL externes).
6. Deployez. Une fois en ligne, executez le seed une seule fois via le Shell Render (onglet "Shell" du service) :
   ```bash
   npm run seed
   ```
7. Votre application est accessible a l'URL fournie par Render (ex. `https://passeporttrack.onrender.com`).

### Alternative : Railway (tout-en-un, backend + MySQL au meme endroit)

1. https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. Ajoutez un plugin **MySQL** dans le meme projet Railway (il fournit automatiquement DB_HOST, DB_USER, etc. — a relier a vos variables d'environnement, ou adaptez `backend/config/database.js` pour lire `MYSQL_URL` si Railway l'expose ainsi).
3. Definissez les variables d'environnement de la meme facon que pour Render.
4. Railway expose aussi une URL publique automatiquement.

## 4. Structure du projet

```
passeporttrack/
├── backend/
│   ├── config/database.js
│   ├── models/            (User, Passport, ProductionHistory, Complaint, Notification, LoginHistory)
│   ├── middleware/auth.js (JWT + controle des roles)
│   ├── routes/             (auth, users, passports, complaints, import, reports)
│   ├── utils/               (stateMachine.js, notify.js)
│   ├── seeders/seed.js
│   └── server.js
├── frontend/
│   ├── index.html          (connexion)
│   ├── pages/               (dashboard, enrolement, production, produit, quarantaine, reception, plaintes, utilisateurs, rapports, detail)
│   ├── js/                  (api.js, sidebar.js)
│   └── css/style.css
├── render.yaml
├── .env.example
└── package.json
```

## 5. Securite a renforcer avant une mise en production reelle

- Changez `JWT_SECRET` et tous les mots de passe de demonstration.
- Mettez en place des migrations Sequelize plutot que `sequelize.sync()`.
- Limitez le CORS a votre domaine reel (actuellement ouvert en `*`).
- Activez HTTPS (automatique sur Render/Railway).
- Ajoutez une politique de sauvegarde reguliere de la base MySQL.

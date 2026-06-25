require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { Server } = require('socket.io');

const { sequelize } = require('./models');
const { setIo } = require('./utils/notify');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
setIo(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend statique
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/passports', require('./routes/passports'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/import', require('./routes/import'));
app.use('/api/reports', require('./routes/reports'));

app.get('/health', (req, res) => res.json({ status: 'ok', date: new Date() }));

// Toute autre route renvoie l'app frontend (SPA-like fallback)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connecte au temps reel :', socket.id);
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL etablie.');
    await sequelize.sync(); // utiliser des migrations en production
    server.listen(PORT, () => console.log(`PasseportTrack demarre sur le port ${PORT}`));
  } catch (err) {
    console.error('Erreur de demarrage :', err.message);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };

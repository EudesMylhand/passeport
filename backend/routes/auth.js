const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, LoginHistory } = require('../models');
const { SECRET, authenticate } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.actif) {
      return res.status(401).json({ message: 'Identifiants incorrects ou compte desactive.' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom, prenom: user.prenom, email: user.email },
      SECRET,
      { expiresIn: '8h' }
    );
    await LoginHistory.create({
      user_id: user.id,
      adresse_ip: req.ip,
      navigateur: req.headers['user-agent']
    });
    res.json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.', error: err.message });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const last = await LoginHistory.findOne({
      where: { user_id: req.user.id },
      order: [['date_connexion', 'DESC']]
    });
    if (last) {
      last.date_deconnexion = new Date();
      await last.save();
    }
    res.json({ message: 'Deconnexion reussie.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la deconnexion.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/reset-password', authenticate, async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await user.comparePassword(ancien_mot_de_passe);
    if (!valid) return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    user.password = nouveau_mot_de_passe;
    await user.save();
    res.json({ message: 'Mot de passe mis a jour avec succes.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la reinitialisation.' });
  }
});

module.exports = router;

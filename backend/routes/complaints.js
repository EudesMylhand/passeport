const express = require('express');
const router = express.Router();
const { Complaint, Passport } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { emitNotification } = require('../utils/notify');

router.use(authenticate);

router.get('/', async (req, res) => {
  const { statut } = req.query;
  const where = {};
  if (statut) where.statut = statut;
  const plaintes = await Complaint.findAll({ where, include: [{ model: Passport }], order: [['date', 'DESC']] });
  res.json(plaintes);
});

router.post('/', authorize('super_admin', 'reception_plaintes'), async (req, res) => {
  try {
    const { passport_id, description } = req.body;
    const passport = await Passport.findByPk(passport_id);
    if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });

    const numero_dossier = 'PL-' + Date.now();
    const plainte = await Complaint.create({ numero_dossier, passport_id, description });

    passport.statut = 'plainte_ouverte';
    await passport.save();

    emitNotification('Nouvelle plainte', `Dossier ${numero_dossier} ouvert pour le passeport ${passport.numero_passeport || passport.id}.`);
    res.status(201).json(plainte);
  } catch (err) {
    res.status(400).json({ message: 'Erreur creation plainte.', error: err.message });
  }
});

router.patch('/:id/statut', authorize('super_admin', 'reception_plaintes'), async (req, res) => {
  const { statut, resolution } = req.body;
  const plainte = await Complaint.findByPk(req.params.id);
  if (!plainte) return res.status(404).json({ message: 'Plainte introuvable.' });
  plainte.statut = statut;
  if (resolution) plainte.resolution = resolution;
  await plainte.save();

  if (statut === 'resolue') {
    const passport = await Passport.findByPk(plainte.passport_id);
    if (passport) {
      passport.statut = 'plainte_resolue';
      await passport.save();
    }
  }
  res.json(plainte);
});

module.exports = router;

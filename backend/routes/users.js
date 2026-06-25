const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin'));

router.get('/', async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const { password, ...safe } = user.toJSON();
    res.status(201).json(safe);
  } catch (err) {
    res.status(400).json({ message: 'Erreur creation utilisateur.', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await user.update(req.body);
    const { password, ...safe } = user.toJSON();
    res.json(safe);
  } catch (err) {
    res.status(400).json({ message: 'Erreur mise a jour utilisateur.', error: err.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  user.actif = !user.actif;
  await user.save();
  res.json({ message: `Utilisateur ${user.actif ? 'active' : 'desactive'}.` });
});

router.delete('/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Utilisateur supprime.' });
});

module.exports = router;

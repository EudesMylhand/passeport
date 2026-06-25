const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { Passport, ProductionHistory } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { canTransition } = require('../utils/stateMachine');
const { emitNotification } = require('../utils/notify');

router.use(authenticate);

// IMPORTANT : les routes specifiques (next-ref, bulk-status...) doivent etre
// declarees AVANT les routes parametrees (/:id) pour eviter les conflits de routage Express.

router.get('/next-ref', async (req, res) => {
  const count = await Passport.count();
  const numero = 'PCG-' + new Date().getFullYear() + '-' + String(count + 1).padStart(6, '0');
  res.json({ numero_passeport: numero });
});

router.get('/stats/dashboard', async (req, res) => {
  const statuts = ['enrole', 'en_production', 'produit', 'quarantaine', 'pret_a_livrer', 'livre', 'plainte_ouverte'];
  const result = {};
  for (const s of statuts) {
    result[s] = await Passport.count({ where: { statut: s } });
  }
  res.json(result);
});

router.get('/', async (req, res) => {
  const { statut, nom, prenoms, date_enrolement, page = 1, limit = 25, search } = req.query;
  const where = {};
  if (statut) where.statut = statut;
  if (nom) where.nom = { [Op.like]: `%${nom}%` };
  if (prenoms) where.prenoms = { [Op.like]: `%${prenoms}%` };
  if (date_enrolement) where.date_enrolement = date_enrolement;
  if (search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${search}%` } },
      { prenoms: { [Op.like]: `%${search}%` } },
      { numero_passeport: { [Op.like]: `%${search}%` } }
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await Passport.findAndCountAll({
    where, offset, limit: parseInt(limit), order: [['date_enrolement', 'DESC']]
  });
  res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), data: rows });
});

router.post('/', authorize('super_admin', 'enrolement'), async (req, res) => {
  try {
    const passport = await Passport.create({ ...req.body, statut: 'enrole' });
    await ProductionHistory.create({
      passport_id: passport.id, ancien_statut: null, nouveau_statut: 'enrole',
      utilisateur: `${req.user.prenom} ${req.user.nom}`, commentaire: 'Enrolement initial'
    });
    emitNotification('Nouvel enrolement', `${passport.nom} ${passport.prenoms} a ete enrole.`);
    res.status(201).json(passport);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la creation.', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const passport = await Passport.findByPk(req.params.id, {
    include: [{ model: ProductionHistory, as: 'historique', order: [['date_modification', 'DESC']] }]
  });
  if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });
  res.json(passport);
});

router.put('/:id', authorize('super_admin', 'enrolement'), async (req, res) => {
  const passport = await Passport.findByPk(req.params.id);
  if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });
  if (passport.statut !== 'enrole') {
    return res.status(400).json({ message: 'Modification impossible : le passeport est deja en production.' });
  }
  await passport.update(req.body);
  res.json(passport);
});

// Changement de statut unitaire avec verification de la machine a etats
router.patch('/:id/statut', authorize('super_admin', 'production', 'reception_plaintes'), async (req, res) => {
  const { nouveau_statut, commentaire, motif_quarantaine } = req.body;
  const passport = await Passport.findByPk(req.params.id);
  if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });

  if (!canTransition(passport.statut, nouveau_statut, req.user.role)) {
    return res.status(400).json({
      message: `Transition non autorisee : ${passport.statut} -> ${nouveau_statut} pour votre role.`
    });
  }

  const ancien = passport.statut;
  passport.statut = nouveau_statut;
  if (nouveau_statut === 'quarantaine') passport.motif_quarantaine = motif_quarantaine || commentaire;
  await passport.save();

  await ProductionHistory.create({
    passport_id: passport.id, ancien_statut: ancien, nouveau_statut,
    utilisateur: `${req.user.prenom} ${req.user.nom}`, commentaire
  });

  emitNotification('Changement de statut', `Passeport ${passport.numero_passeport || passport.id} : ${ancien} -> ${nouveau_statut}`);
  res.json(passport);
});

// Changement de statut en masse
router.post('/bulk-status', authorize('super_admin', 'production'), async (req, res) => {
  const { ids, nouveau_statut, commentaire } = req.body;
  const resultats = [];
  for (const id of ids) {
    const passport = await Passport.findByPk(id);
    if (!passport) continue;
    if (!canTransition(passport.statut, nouveau_statut, req.user.role)) {
      resultats.push({ id, ok: false, message: 'Transition non autorisee.' });
      continue;
    }
    const ancien = passport.statut;
    passport.statut = nouveau_statut;
    await passport.save();
    await ProductionHistory.create({
      passport_id: id, ancien_statut: ancien, nouveau_statut,
      utilisateur: `${req.user.prenom} ${req.user.nom}`, commentaire
    });
    resultats.push({ id, ok: true });
  }
  emitNotification('Mise a jour groupee', `${resultats.filter(r => r.ok).length} passeport(s) mis a jour.`);
  res.json({ resultats });
});

// Livraison
router.post('/:id/livrer', authorize('super_admin', 'reception_plaintes'), async (req, res) => {
  const { destinataire } = req.body;
  const passport = await Passport.findByPk(req.params.id);
  if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });
  if (passport.statut !== 'pret_a_livrer') {
    return res.status(400).json({ message: 'Le passeport doit etre au statut "Pret a livrer".' });
  }
  passport.statut = 'livre';
  passport.date_livraison = new Date();
  passport.agent_livraison = `${req.user.prenom} ${req.user.nom}`;
  passport.destinataire = destinataire;
  await passport.save();
  await ProductionHistory.create({
    passport_id: passport.id, ancien_statut: 'pret_a_livrer', nouveau_statut: 'livre',
    utilisateur: `${req.user.prenom} ${req.user.nom}`, commentaire: `Livre a ${destinataire}`
  });
  emitNotification('Passeport livre', `Passeport ${passport.numero_passeport} livre a ${destinataire}.`);
  res.json(passport);
});

// Accuse de reception PDF avec QR code
router.get('/:id/accuse-reception', async (req, res) => {
  const passport = await Passport.findByPk(req.params.id);
  if (!passport) return res.status(404).json({ message: 'Passeport introuvable.' });

  const verifUrl = `${req.protocol}://${req.get('host')}/verif/${passport.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifUrl);
  const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=accuse_${passport.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text('REPUBLIQUE DU CONGO', { align: 'center' });
  doc.fontSize(13).text('Accuse de Reception de Passeport', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(11);
  doc.text(`Numero de passeport : ${passport.numero_passeport || '-'}`);
  doc.text(`Nom : ${passport.nom}`);
  doc.text(`Prenoms : ${passport.prenoms}`);
  doc.text(`Date de livraison : ${passport.date_livraison ? new Date(passport.date_livraison).toLocaleString('fr-FR') : '-'}`);
  doc.text(`Agent responsable : ${passport.agent_livraison || '-'}`);
  doc.text(`Destinataire : ${passport.destinataire || '-'}`);
  doc.moveDown(2);
  doc.text('Signature du beneficiaire : ______________________');
  doc.moveDown(2);
  doc.image(qrImage, { width: 110, align: 'center' });
  doc.moveDown(1);
  doc.fontSize(9).text('Scannez ce code pour verifier l\'authenticite de ce document.', { align: 'center' });
  doc.end();
});

module.exports = router;

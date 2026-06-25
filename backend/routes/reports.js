const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { Passport, Complaint } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

async function exportToExcel(res, filename, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rapport');
  sheet.columns = columns;
  rows.forEach(r => sheet.addRow(r));
  sheet.getRow(1).font = { bold: true };
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
}

router.get('/export/passeports', authorize('super_admin', 'enrolement', 'production'), async (req, res) => {
  const { statut } = req.query;
  const where = statut ? { statut } : {};
  const passeports = await Passport.findAll({ where, order: [['date_enrolement', 'DESC']] });
  await exportToExcel(res, 'passeports.xlsx', [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Numero', key: 'numero_passeport', width: 18 },
    { header: 'Nom', key: 'nom', width: 18 },
    { header: 'Prenoms', key: 'prenoms', width: 22 },
    { header: 'Sexe', key: 'sexe', width: 8 },
    { header: 'Date naissance', key: 'date_naissance', width: 16 },
    { header: 'Date enrolement', key: 'date_enrolement', width: 16 },
    { header: 'Statut', key: 'statut', width: 16 }
  ], passeports.map(p => p.toJSON()));
});

router.get('/journalier', authorize('super_admin'), async (req, res) => {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const count = await Passport.count({ where: { date_enrolement: aujourdhui } });
  const parStatut = {};
  for (const s of ['enrole', 'en_production', 'produit', 'livre']) {
    parStatut[s] = await Passport.count({ where: { statut: s, date_enrolement: aujourdhui } });
  }
  res.json({ date: aujourdhui, total: count, par_statut: parStatut });
});

router.get('/mensuel', authorize('super_admin'), async (req, res) => {
  const debut = new Date();
  debut.setDate(1);
  const passeports = await Passport.findAll({
    where: { date_enrolement: { [Op.gte]: debut.toISOString().slice(0, 10) } }
  });
  res.json({ mois: debut.toISOString().slice(0, 7), total: passeports.length });
});

router.get('/plaintes', authorize('super_admin', 'reception_plaintes'), async (req, res) => {
  const plaintes = await Complaint.findAll();
  const total = plaintes.length;
  const ouvertes = plaintes.filter(p => p.statut === 'ouverte').length;
  const resolues = plaintes.filter(p => p.statut === 'resolue').length;
  res.json({ total, ouvertes, en_cours: total - ouvertes - resolues, resolues });
});

module.exports = router;

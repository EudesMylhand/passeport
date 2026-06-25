const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { Passport } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { emitNotification } = require('../utils/notify');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

router.use(authenticate, authorize('super_admin', 'enrolement'));

function parseTxtLine(line) {
  // Format attendu : nom;prenoms;sexe;date_naissance(AAAA-MM-JJ)
  const [nom, prenoms, sexe, date_naissance] = line.split(';').map(v => v && v.trim());
  return { nom, prenoms, sexe, date_naissance };
}

router.post('/', upload.single('fichier'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  let lignes = [];

  try {
    if (ext === '.csv') {
      lignes = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => data.push(row))
          .on('end', () => resolve(data))
          .on('error', reject);
      });
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      lignes = XLSX.utils.sheet_to_json(sheet);
    } else if (ext === '.txt') {
      const content = fs.readFileSync(filePath, 'utf-8');
      lignes = content.split('\n').filter(Boolean).map(parseTxtLine);
    } else {
      return res.status(400).json({ message: 'Format non supporte. Utilisez CSV, XLSX ou TXT.' });
    }

    let importes = 0, doublons = 0, erreurs = 0;
    for (const ligne of lignes) {
      const nom = ligne.nom || ligne.Nom;
      const prenoms = ligne.prenoms || ligne.Prenoms || ligne.prenom || ligne.Prenom;
      const sexe = (ligne.sexe || ligne.Sexe || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
      const date_naissance = ligne.date_naissance || ligne.Date_naissance || null;

      if (!nom || !prenoms) { erreurs++; continue; }

      const existe = await Passport.findOne({ where: { nom, prenoms, date_naissance } });
      if (existe) { doublons++; continue; }

      await Passport.create({ nom, prenoms, sexe, date_naissance, statut: 'enrole' });
      importes++;
    }

    fs.unlinkSync(filePath);
    emitNotification('Importation terminee', `${importes} passeport(s) importe(s), ${doublons} doublon(s) ignore(s).`);
    res.json({ message: 'Importation terminee.', importes, doublons, erreurs, total_lignes: lignes.length });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Erreur lors de l\'importation.', error: err.message });
  }
});

module.exports = router;

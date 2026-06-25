require('dotenv').config();
const { sequelize, User, Passport } = require('../models');

const utilisateurs = [
  { nom: 'Mabiala', prenom: 'Jean', email: 'admin@passeporttrack.cg', telephone: '+242060000001', service: 'Direction Generale', role: 'super_admin', password: 'Admin@2026' },
  { nom: 'Nkounkou', prenom: 'Sylvie', email: 'enrolement@passeporttrack.cg', telephone: '+242060000002', service: 'Enrolement', role: 'enrolement', password: 'Enrol@2026' },
  { nom: 'Bemba', prenom: 'Patrick', email: 'production@passeporttrack.cg', telephone: '+242060000003', service: 'Production', role: 'production', password: 'Prod@2026' },
  { nom: 'Loubassou', prenom: 'Ange', email: 'produit@passeporttrack.cg', telephone: '+242060000004', service: 'Controle', role: 'produit', password: 'Produit@2026' },
  { nom: 'Tchicaya', prenom: 'Grace', email: 'quarantaine@passeporttrack.cg', telephone: '+242060000005', service: 'Quarantaine', role: 'quarantaine', password: 'Quar@2026' },
  { nom: 'Massamba', prenom: 'Eudes', email: 'reception@passeporttrack.cg', telephone: '+242060000006', service: 'Reception et Plaintes', role: 'reception_plaintes', password: 'Recept@2026' }
];

const passeportsDemo = [
  { nom: 'Obami', prenoms: 'Pierre', sexe: 'M', date_naissance: '1990-04-12', statut: 'enrole' },
  { nom: 'Mouanga', prenoms: 'Aline', sexe: 'F', date_naissance: '1988-09-23', statut: 'en_production' },
  { nom: 'Samba', prenoms: 'David', sexe: 'M', date_naissance: '1995-01-05', statut: 'produit' },
  { nom: 'Kimbembe', prenoms: 'Olga', sexe: 'F', date_naissance: '1992-07-30', statut: 'quarantaine', motif_quarantaine: 'Photo non conforme' },
  { nom: 'Ngoma', prenoms: 'Hugo', sexe: 'M', date_naissance: '1985-11-15', statut: 'pret_a_livrer' },
  { nom: 'Bakala', prenoms: 'Chantal', sexe: 'F', date_naissance: '1998-03-02', statut: 'livre', date_livraison: new Date(), agent_livraison: 'Massamba Eudes', destinataire: 'Bakala Chantal' }
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Base synchronisee (force: true - donnees existantes effacees).');

  for (const u of utilisateurs) {
    await User.create(u);
  }
  console.log(`${utilisateurs.length} utilisateurs crees.`);

  for (const p of passeportsDemo) {
    await Passport.create({
      ...p,
      numero_passeport: 'PCG-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000) + 100000)
    });
  }
  console.log(`${passeportsDemo.length} passeports de demonstration crees.`);

  console.log('\n=== Comptes de demonstration ===');
  utilisateurs.forEach(u => console.log(`${u.role.padEnd(20)} : ${u.email} / ${u.password}`));

  process.exit(0);
}

seed().catch(err => {
  console.error('Erreur de seed :', err);
  process.exit(1);
});

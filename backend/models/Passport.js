const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Passport = sequelize.define('Passport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_passeport: { type: DataTypes.STRING, unique: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenoms: { type: DataTypes.STRING, allowNull: false },
  sexe: { type: DataTypes.ENUM('M', 'F'), allowNull: false },
  date_naissance: { type: DataTypes.DATEONLY },
  date_enrolement: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  statut: {
    type: DataTypes.ENUM(
      'enrole', 'en_production', 'produit', 'quarantaine',
      'pret_a_livrer', 'livre', 'plainte_ouverte', 'plainte_resolue'
    ),
    defaultValue: 'enrole'
  },
  motif_quarantaine: { type: DataTypes.TEXT, allowNull: true },
  date_livraison: { type: DataTypes.DATE, allowNull: true },
  agent_livraison: { type: DataTypes.STRING, allowNull: true },
  destinataire: { type: DataTypes.STRING, allowNull: true },
  qr_code_path: { type: DataTypes.STRING, allowNull: true },
  utilisateur_responsable: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'passports'
});

module.exports = Passport;

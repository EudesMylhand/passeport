const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_dossier: { type: DataTypes.STRING, unique: true },
  passport_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  statut: { type: DataTypes.ENUM('ouverte', 'en_cours', 'resolue'), defaultValue: 'ouverte' },
  resolution: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'complaints'
});

module.exports = Complaint;

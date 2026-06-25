const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionHistory = sequelize.define('ProductionHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  passport_id: { type: DataTypes.INTEGER, allowNull: false },
  ancien_statut: { type: DataTypes.STRING },
  nouveau_statut: { type: DataTypes.STRING },
  utilisateur: { type: DataTypes.STRING },
  date_modification: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  commentaire: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'production_history',
  timestamps: false
});

module.exports = ProductionHistory;

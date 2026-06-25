const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING },
  message: { type: DataTypes.STRING },
  lue: { type: DataTypes.BOOLEAN, defaultValue: false },
  user_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'notifications'
});

const LoginHistory = sequelize.define('LoginHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  date_connexion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  date_deconnexion: { type: DataTypes.DATE, allowNull: true },
  adresse_ip: { type: DataTypes.STRING },
  navigateur: { type: DataTypes.STRING }
}, {
  tableName: 'login_history',
  timestamps: false
});

module.exports = { Notification, LoginHistory };

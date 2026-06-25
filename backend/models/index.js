const sequelize = require('../config/database');
const User = require('./User');
const Passport = require('./Passport');
const ProductionHistory = require('./ProductionHistory');
const Complaint = require('./Complaint');
const { Notification, LoginHistory } = require('./Notification');

Passport.hasMany(ProductionHistory, { foreignKey: 'passport_id', as: 'historique' });
ProductionHistory.belongsTo(Passport, { foreignKey: 'passport_id' });

Passport.hasMany(Complaint, { foreignKey: 'passport_id', as: 'plaintes' });
Complaint.belongsTo(Passport, { foreignKey: 'passport_id' });

User.hasMany(LoginHistory, { foreignKey: 'user_id' });
LoginHistory.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Passport, ProductionHistory, Complaint, Notification, LoginHistory };

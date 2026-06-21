const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 100] },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Token para recuperação de senha (gerado no forgot-password)
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  resetTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  // Minuto atual da simulação (0–59). Minuto 0 = 14:00 hs.
  simulationMinute: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 59 },
  },
  // Saldo da conta corrente em R$
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: process.env.INITIAL_BALANCE || 10000.0,
  },
});

module.exports = User;

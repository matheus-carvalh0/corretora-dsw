const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
  // 'DEPOSIT' (crédito) ou 'WITHDRAWAL' (débito)
  type: {
    type: DataTypes.ENUM('DEPOSIT', 'WITHDRAWAL'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // Saldo da conta após este lançamento
  balanceAfter: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // Minuto da simulação em que ocorreu o lançamento
  simulationMinute: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Transaction;

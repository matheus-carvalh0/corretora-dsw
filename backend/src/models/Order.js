const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
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
  ticker: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  // 'BUY' ou 'SELL'
  type: {
    type: DataTypes.ENUM('BUY', 'SELL'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  // null = ordem a mercado; número = ordem limitada
  limitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
  },
  // 'PENDING' | 'EXECUTED' | 'CANCELLED'
  status: {
    type: DataTypes.ENUM('PENDING', 'EXECUTED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  executedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  executedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
  },
  // Minuto da simulação em que a ordem foi criada
  simulationMinute: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Order;

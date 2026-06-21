const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Cada registro representa uma posição do usuário em determinado ticker
const PortfolioItem = sequelize.define('PortfolioItem', {
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
  // Quantidade de ações possuídas
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  // Preço médio de compra (custo médio ponderado)
  avgBuyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  indexes: [
    { unique: true, fields: ['userId', 'ticker'] },
  ],
});

module.exports = PortfolioItem;

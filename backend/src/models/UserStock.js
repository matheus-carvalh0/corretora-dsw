const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Ações que o usuário escolheu visualizar na tela de mercado
const UserStock = sequelize.define('UserStock', {
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
    validate: { notEmpty: true },
  },
}, {
  indexes: [
    { unique: true, fields: ['userId', 'ticker'] },
  ],
});

module.exports = UserStock;

const sequelize = require('../config/database');
const User = require('./User');
const UserStock = require('./UserStock');
const PortfolioItem = require('./PortfolioItem');
const Order = require('./Order');
const Transaction = require('./Transaction');

// --- Associações ---
User.hasMany(UserStock, { foreignKey: 'userId', as: 'watchlist', onDelete: 'CASCADE' });
UserStock.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PortfolioItem, { foreignKey: 'userId', as: 'portfolio', onDelete: 'CASCADE' });
PortfolioItem.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

/**
 * Sincroniza todos os modelos com o banco de dados.
 * Em desenvolvimento usa { alter: true } para aplicar mudanças sem recriar.
 */
const syncDatabase = async () => {
  const options = process.env.NODE_ENV === 'production'
    ? {}
    : { alter: true };

  await sequelize.sync(options);
  console.log('Banco de dados sincronizado.');
};

module.exports = { sequelize, User, UserStock, PortfolioItem, Order, Transaction, syncDatabase };

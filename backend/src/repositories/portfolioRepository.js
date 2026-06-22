const { PortfolioItem } = require('../models');

const findAllByUser = (userId) =>
  PortfolioItem.findAll({ where: { userId } });

const findOne = (userId, ticker) =>
  PortfolioItem.findOne({ where: { userId, ticker } });

const upsert = async (userId, ticker, quantity, avgBuyPrice, realizedPnl = null) => {
  const [item, created] = await PortfolioItem.findOrCreate({
    where: { userId, ticker },
    defaults: { quantity, avgBuyPrice, realizedPnl: realizedPnl || 0 },
  });
  if (!created) {
    item.quantity = quantity;
    item.avgBuyPrice = avgBuyPrice;
    if (realizedPnl !== null) {
      item.realizedPnl = realizedPnl;
    }
    await item.save();
  }
  return item;
};

const remove = (userId, ticker) =>
  PortfolioItem.destroy({ where: { userId, ticker } });

module.exports = { findAllByUser, findOne, upsert, remove };

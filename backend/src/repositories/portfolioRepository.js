const { PortfolioItem } = require('../models');

const findAllByUser = (userId) =>
  PortfolioItem.findAll({ where: { userId } });

const findOne = (userId, ticker) =>
  PortfolioItem.findOne({ where: { userId, ticker } });

const upsert = async (userId, ticker, quantity, avgBuyPrice) => {
  const [item, created] = await PortfolioItem.findOrCreate({
    where: { userId, ticker },
    defaults: { quantity, avgBuyPrice },
  });
  if (!created) {
    item.quantity = quantity;
    item.avgBuyPrice = avgBuyPrice;
    await item.save();
  }
  return item;
};

const remove = (userId, ticker) =>
  PortfolioItem.destroy({ where: { userId, ticker } });

module.exports = { findAllByUser, findOne, upsert, remove };

const stockService = require('../services/stockService');
const { success, created, noContent } = require('../utils/response');
const { validate } = require('../utils/validators');
const { body } = require('express-validator');

const addStockRules = [
  body('ticker').trim().notEmpty().withMessage('Ticker obrigatório.').toUpperCase(),
];

const getStocks = async (req, res, next) => {
  try {
    const stocks = await stockService.getUserStocks(req.user.id);
    return success(res, { stocks });
  } catch (err) { next(err); }
};

const addStock = async (req, res, next) => {
  try {
    validate(req);
    const stock = await stockService.addStock(req.user.id, req.body.ticker.toUpperCase());
    return created(res, { stock }, `Ação ${stock.ticker} adicionada à lista.`);
  } catch (err) { next(err); }
};

const removeStock = async (req, res, next) => {
  try {
    await stockService.removeStock(req.user.id, req.params.ticker.toUpperCase());
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { getStocks, addStock, addStockRules, removeStock };

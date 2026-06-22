const stockService = require('../services/stockService');
const { success, created, noContent } = require('../utils/response');
const { validate } = require('../utils/validators');
const { body } = require('express-validator');

const addStockRules = [
  body('ticker').trim().notEmpty().withMessage('Ticker obrigatório.').toUpperCase(),
];

const marketService = require('../services/marketService');

const getStocks = async (req, res, next) => {
  try {
    const stocks = await stockService.getUserStocks(req.user.id);
    const { market } = await marketService.getMarket(req.user, stocks);
    return success(res, { stocks: market });
  } catch (err) { next(err); }
};

const addStock = async (req, res, next) => {
  try {
    validate(req);
    await stockService.addStock(req.user.id, req.body.ticker.toUpperCase());
    
    // Retorna a lista atualizada e enriquecida
    const stocks = await stockService.getUserStocks(req.user.id);
    const { market } = await marketService.getMarket(req.user, stocks);
    return created(res, { stocks: market }, `Ação adicionada à lista.`);
  } catch (err) { next(err); }
};

const removeStock = async (req, res, next) => {
  try {
    await stockService.removeStock(req.user.id, req.params.ticker.toUpperCase());
    
    // Retorna a lista atualizada e enriquecida
    const stocks = await stockService.getUserStocks(req.user.id);
    const { market } = await marketService.getMarket(req.user, stocks);
    return success(res, { stocks: market }, `Ação removida da lista.`);
  } catch (err) { next(err); }
};

module.exports = { getStocks, addStock, addStockRules, removeStock };

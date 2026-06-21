const { body } = require('express-validator');
const portfolioService = require('../services/portfolioService');
const { success, created } = require('../utils/response');
const { validate } = require('../utils/validators');

const buyRules = [
  body('ticker').trim().notEmpty().withMessage('Ticker obrigatório.'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser inteiro positivo.'),
  body('limitPrice').optional({ nullable: true }).isFloat({ min: 0.01 }).withMessage('Preço limite inválido.'),
];

const sellRules = [
  body('ticker').trim().notEmpty().withMessage('Ticker obrigatório.'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser inteiro positivo.'),
  body('limitPrice').optional({ nullable: true }).isFloat({ min: 0.01 }).withMessage('Preço limite inválido.'),
];

const getPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolio(req.user);
    return success(res, data);
  } catch (err) { next(err); }
};

const buyStock = async (req, res, next) => {
  try {
    validate(req);
    const { ticker, quantity, limitPrice = null } = req.body;
    const result = await portfolioService.buyStock(
      req.user.id,
      ticker.toUpperCase(),
      parseInt(quantity),
      limitPrice ? parseFloat(limitPrice) : null
    );
    return created(res, result);
  } catch (err) { next(err); }
};

const sellStock = async (req, res, next) => {
  try {
    validate(req);
    const { ticker, quantity, limitPrice = null } = req.body;
    const result = await portfolioService.sellStock(
      req.user.id,
      ticker.toUpperCase(),
      parseInt(quantity),
      limitPrice ? parseFloat(limitPrice) : null
    );
    return success(res, result);
  } catch (err) { next(err); }
};

module.exports = { getPortfolio, buyStock, buyRules, sellStock, sellRules };

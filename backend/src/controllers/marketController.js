const marketService = require('../services/marketService');
const stockService = require('../services/stockService');
const { success } = require('../utils/response');
const { formatSimulationTime } = require('../utils/validators');

const getMarket = async (req, res, next) => {
  try {
    const userStocks = await stockService.getUserStocks(req.user.id);
    const { minute, market } = await marketService.getMarket(req.user, userStocks);

    return success(res, {
      simulationMinute: minute,
      simulationTime: formatSimulationTime(minute),
      market,
    });
  } catch (err) { next(err); }
};

const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const getTime = async (req, res, next) => {
  try {
    const { simulationMinute } = req.user;
    return success(res, {
      simulationMinute,
      simulationTime: formatSimulationTime(simulationMinute),
    });
  } catch (err) { next(err); }
};

const advanceTimeRules = [
  body('minutes').isInt({ min: 1 }).withMessage('Minutos deve ser um número inteiro positivo.'),
];

const advanceTime = async (req, res, next) => {
  try {
    validate(req);
    const { minutes } = req.body;
    const updated = await marketService.advanceClock(req.user.id, parseInt(minutes, 10));
    
    // Retorna apenas a confirmação e o novo tempo, para ser mais limpo
    return success(res, {
      simulationMinute: updated.simulationMinute,
      simulationTime: formatSimulationTime(updated.simulationMinute),
    }, `Relógio avançado em +${minutes} minutos.`);
  } catch (err) { next(err); }
};

// Retorna todos os tickers disponíveis no mercado (para o modal de adicionar ação)
const getTickers = async (_req, res, next) => {
  try {
    const tickers = await marketService.fetchTickers();
    return success(res, { tickers });
  } catch (err) { next(err); }
};

module.exports = { getMarket, getTime, advanceTimeRules, advanceTime, getTickers };

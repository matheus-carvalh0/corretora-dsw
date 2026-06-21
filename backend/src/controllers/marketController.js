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

const advanceMinute = async (req, res, next) => {
  try {
    const updated = await marketService.advanceClock(req.user.id, 1);
    const userStocks = await stockService.getUserStocks(req.user.id);
    const { minute, market } = await marketService.getMarket(updated, userStocks);

    return success(res, {
      simulationMinute: minute,
      simulationTime: formatSimulationTime(minute),
      market,
    }, 'Relógio avançado em +1 minuto.');
  } catch (err) { next(err); }
};

const advanceFiveMinutes = async (req, res, next) => {
  try {
    const updated = await marketService.advanceClock(req.user.id, 5);
    const userStocks = await stockService.getUserStocks(req.user.id);
    const { minute, market } = await marketService.getMarket(updated, userStocks);

    return success(res, {
      simulationMinute: minute,
      simulationTime: formatSimulationTime(minute),
      market,
    }, 'Relógio avançado em +5 minutos.');
  } catch (err) { next(err); }
};

// Retorna todos os tickers disponíveis no mercado (para o modal de adicionar ação)
const getTickers = async (_req, res, next) => {
  try {
    const tickers = await marketService.fetchTickers();
    return success(res, { tickers });
  } catch (err) { next(err); }
};

module.exports = { getMarket, advanceMinute, advanceFiveMinutes, getTickers };

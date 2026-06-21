const userStockRepository = require('../repositories/userStockRepository');
const marketService = require('./marketService');

/**
 * Retorna a watchlist do usuário com dados de mercado.
 */
const getUserStocks = (userId) =>
  userStockRepository.findAllByUser(userId);

/**
 * Adiciona um ticker à watchlist do usuário.
 * Valida se o ticker existe no mercado.
 */
const addStock = async (userId, ticker) => {
  // Valida se ticker existe no mercado
  const tickers = await marketService.fetchTickers();
  const valid = tickers.some((t) => t.ticker === ticker);
  if (!valid) {
    const err = new Error(`Ticker "${ticker}" não encontrado no mercado.`);
    err.status = 404;
    throw err;
  }

  // Verifica se já está na watchlist
  const existing = await userStockRepository.findOne(userId, ticker);
  if (existing) {
    const err = new Error(`Ticker "${ticker}" já está na sua lista.`);
    err.status = 409;
    throw err;
  }

  return userStockRepository.create(userId, ticker);
};

/**
 * Remove um ticker da watchlist do usuário.
 */
const removeStock = async (userId, ticker) => {
  const deleted = await userStockRepository.remove(userId, ticker);
  if (!deleted) {
    const err = new Error(`Ticker "${ticker}" não encontrado na sua lista.`);
    err.status = 404;
    throw err;
  }
};

module.exports = { getUserStocks, addStock, removeStock };

const axios = require('axios');
const userRepository = require('../repositories/userRepository');
const orderRepository = require('../repositories/orderRepository');

const TICKERS_URL =
  'https://raw.githubusercontent.com/marciobarros/dsw-simulador-corretora/refs/heads/main/tickers.json';

const PRICES_URL = (minute) =>
  `https://raw.githubusercontent.com/marciobarros/dsw-simulador-corretora/refs/heads/main/${minute}.json`;

const MAX_MINUTE = parseInt(process.env.SIMULATION_MAX_MINUTE || '59', 10);

/** Busca a lista de todos os tickers com preço de fechamento. */
const fetchTickers = async () => {
  const { data } = await axios.get(TICKERS_URL, { timeout: 8000 });
  return data; // [{ ticker, fechamento }]
};

/** Busca os preços atuais para um dado minuto. */
const fetchPrices = async (minute) => {
  const { data } = await axios.get(PRICES_URL(minute), { timeout: 8000 });
  return data; // [{ ticker, preco }]
};

/**
 * Retorna os dados do mercado para o usuário:
 * - lista de tickers da watchlist do usuário
 * - preço atual, variação nominal e percentual
 * - horário atual da simulação
 */
const getMarket = async (user, userStocks) => {
  const minute = user.simulationMinute;

  // Busca tickers (fechamento) e preços atuais em paralelo
  const [tickers, prices] = await Promise.all([
    fetchTickers(),
    minute > 0 ? fetchPrices(minute) : fetchTickers().then((t) => t.map((x) => ({ ticker: x.ticker, preco: x.fechamento }))),
  ]);

  const closingMap = Object.fromEntries(tickers.map((t) => [t.ticker, t.fechamento]));
  const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p.preco]));

  const watchlistTickers = userStocks.map((us) => us.ticker);

  const market = watchlistTickers.map((ticker) => {
    const closing = closingMap[ticker] ?? 0;
    const current = priceMap[ticker] ?? closing;
    const nominalChange = parseFloat((current - closing).toFixed(2));
    const percentChange = closing !== 0
      ? parseFloat(((nominalChange / closing) * 100).toFixed(2))
      : 0;

    return { ticker, current, closing, nominalChange, percentChange };
  });

  return { minute, market };
};

/**
 * Avança o relógio da simulação em +n minutos e processa ordens limitadas pendentes.
 */
const advanceClock = async (userId, minutes) => {
  const user = await userRepository.findById(userId);

  const newMinute = Math.min(user.simulationMinute + minutes, MAX_MINUTE);
  await userRepository.update(userId, { simulationMinute: newMinute });

  // Recarrega usuário atualizado
  const updatedUser = await userRepository.findById(userId);

  // Processa ordens limitadas pendentes ao novo preço
  const executedCount = await processLimitOrders(updatedUser);

  return { user: updatedUser, executedCount };
};

/**
 * Verifica ordens limitadas pendentes do usuário e executa as que
 * atingiram o preço-limite com os preços do minuto atual.
 */
const processLimitOrders = async (user) => {
  const pendingOrders = await orderRepository.findPendingByUser(user.id);
  if (!pendingOrders.length) return 0;

  let executedCount = 0;

  let prices;
  try {
    prices = await fetchPrices(user.simulationMinute);
  } catch (_) {
    return 0; // Não falha se API estiver indisponível
  }

  const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p.preco]));

  // Importação lazy para evitar circular dependency
  const portfolioService = require('./portfolioService');

  for (const order of pendingOrders) {
    const currentPrice = priceMap[order.ticker];
    if (currentPrice === undefined) continue;

    let shouldExecute = false;
    if (order.type === 'BUY' && order.limitPrice !== null && currentPrice <= order.limitPrice) {
      shouldExecute = true;
    } else if (order.type === 'SELL' && order.limitPrice !== null && currentPrice >= order.limitPrice) {
      shouldExecute = true;
    }

    if (shouldExecute) {
      try {
        if (order.type === 'BUY') {
          await portfolioService.executeBuy(user.id, order.ticker, order.quantity, currentPrice, order.id);
        } else {
          await portfolioService.executeSell(user.id, order.ticker, order.quantity, currentPrice, order.id);
        }
        executedCount++;
      } catch (_) {
        // Ordem não pode ser executada (saldo insuficiente etc.) — mantém pendente
      }
    }
  }

  return executedCount;
};

module.exports = { fetchTickers, fetchPrices, getMarket, advanceClock };

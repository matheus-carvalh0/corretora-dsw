const portfolioRepository = require('../repositories/portfolioRepository');
const orderRepository = require('../repositories/orderRepository');
const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
const marketService = require('./marketService');

/**
 * Retorna a carteira do usuário com preços atuais e P&L.
 */
const getPortfolio = async (user) => {
  const items = await portfolioRepository.findAllByUser(user.id);
  if (!items.length) return { items: [], totalPnl: 0 };

  let prices;
  try {
    prices = await marketService.fetchPrices(user.simulationMinute);
  } catch (_) {
    const tickers = await marketService.fetchTickers();
    prices = tickers.map((t) => ({ ticker: t.ticker, preco: t.fechamento }));
  }

  const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p.preco]));

  let totalPnl = 0;
  const enriched = items.map((item) => {
    const currentPrice = priceMap[item.ticker] ?? parseFloat(item.avgBuyPrice);
    const pnl = parseFloat(((currentPrice - item.avgBuyPrice) * item.quantity).toFixed(2));
    totalPnl += pnl;
    return {
      ticker: item.ticker,
      quantity: item.quantity,
      avgBuyPrice: parseFloat(item.avgBuyPrice),
      currentPrice,
      pnl,
    };
  });

  return { items: enriched, totalPnl: parseFloat(totalPnl.toFixed(2)) };
};

/**
 * Cria uma ordem de compra.
 * - limitPrice = null  → executa imediatamente a preço de mercado
 * - limitPrice = X     → cria ordem limitada (executa quando preco <= X)
 */
const buyStock = async (userId, ticker, quantity, limitPrice = null) => {
  const user = await userRepository.findById(userId);

  // Valida ticker
  const tickers = await marketService.fetchTickers();
  if (!tickers.some((t) => t.ticker === ticker)) {
    const err = new Error(`Ticker "${ticker}" não encontrado no mercado.`);
    err.status = 404;
    throw err;
  }

  if (limitPrice === null) {
    // Ordem a mercado: busca preço atual e executa na hora
    let prices;
    try {
      prices = await marketService.fetchPrices(user.simulationMinute);
    } catch (_) {
      prices = tickers.map((t) => ({ ticker: t.ticker, preco: t.fechamento }));
    }
    const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p.preco]));
    const currentPrice = priceMap[ticker];
    if (currentPrice === undefined) {
      const err = new Error('Preço não disponível para este ticker.');
      err.status = 422;
      throw err;
    }

    // Cria a ordem já marcada como EXECUTED
    const order = await orderRepository.create({
      userId,
      ticker,
      type: 'BUY',
      quantity,
      limitPrice: null,
      status: 'EXECUTED',
      executedAt: new Date(),
      executedPrice: currentPrice,
      simulationMinute: user.simulationMinute,
    });

    await executeBuy(userId, ticker, quantity, currentPrice, order.id);
    return { message: 'Compra realizada a preço de mercado.', executedPrice: currentPrice };
  } else {
    // Ordem limitada — apenas registra
    await orderRepository.create({
      userId,
      ticker,
      type: 'BUY',
      quantity,
      limitPrice,
      status: 'PENDING',
      simulationMinute: user.simulationMinute,
    });
    return { message: `Ordem de compra limitada registrada. Executará quando ${ticker} ≤ R$ ${limitPrice}.` };
  }
};

/**
 * Cria uma ordem de venda.
 */
const sellStock = async (userId, ticker, quantity, limitPrice = null) => {
  const user = await userRepository.findById(userId);

  // Verifica se usuário tem a ação na carteira
  const position = await portfolioRepository.findOne(userId, ticker);
  if (!position || position.quantity < quantity) {
    const err = new Error('Quantidade insuficiente em carteira.');
    err.status = 400;
    throw err;
  }

  if (limitPrice === null) {
    let prices;
    try {
      prices = await marketService.fetchPrices(user.simulationMinute);
    } catch (_) {
      const tickers = await marketService.fetchTickers();
      prices = tickers.map((t) => ({ ticker: t.ticker, preco: t.fechamento }));
    }
    const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p.preco]));
    const currentPrice = priceMap[ticker];

    const order = await orderRepository.create({
      userId,
      ticker,
      type: 'SELL',
      quantity,
      limitPrice: null,
      status: 'EXECUTED',
      executedAt: new Date(),
      executedPrice: currentPrice,
      simulationMinute: user.simulationMinute,
    });

    await executeSell(userId, ticker, quantity, currentPrice, order.id);
    return { message: 'Venda realizada a preço de mercado.', executedPrice: currentPrice };
  } else {
    await orderRepository.create({
      userId,
      ticker,
      type: 'SELL',
      quantity,
      limitPrice,
      status: 'PENDING',
      simulationMinute: user.simulationMinute,
    });
    return { message: `Ordem de venda limitada registrada. Executará quando ${ticker} ≥ R$ ${limitPrice}.` };
  }
};

/**
 * Executa efetivamente a compra: debita conta corrente e atualiza carteira.
 * Chamado pelo marketService ao processar ordens limitadas também.
 */
const executeBuy = async (userId, ticker, quantity, price, orderId = null) => {
  const user = await userRepository.findById(userId);
  const totalCost = parseFloat((quantity * price).toFixed(2));

  if (parseFloat(user.balance) < totalCost) {
    if (orderId) {
      // Cancela a ordem se não há saldo
      await orderRepository.updateStatus(orderId, 'CANCELLED');
    }
    const err = new Error(`Saldo insuficiente. Necessário: R$ ${totalCost.toFixed(2)}, disponível: R$ ${parseFloat(user.balance).toFixed(2)}.`);
    err.status = 400;
    throw err;
  }

  const newBalance = parseFloat((parseFloat(user.balance) - totalCost).toFixed(2));
  await userRepository.update(userId, { balance: newBalance });

  // Atualiza posição na carteira (custo médio ponderado)
  const existing = await portfolioRepository.findOne(userId, ticker);
  let newQty, newAvg;
  if (existing && existing.quantity > 0) {
    newQty = existing.quantity + quantity;
    newAvg = parseFloat(
      ((existing.avgBuyPrice * existing.quantity + price * quantity) / newQty).toFixed(2)
    );
  } else {
    newQty = quantity;
    newAvg = price;
  }
  await portfolioRepository.upsert(userId, ticker, newQty, newAvg);

  // Lança débito na conta corrente
  await transactionRepository.create({
    userId,
    type: 'WITHDRAWAL',
    amount: totalCost,
    description: `Compra de ${quantity}x ${ticker} a R$ ${price.toFixed(2)}`,
    balanceAfter: newBalance,
    simulationMinute: user.simulationMinute,
  });

  // Atualiza status da ordem
  if (orderId) {
    await orderRepository.updateStatus(orderId, 'EXECUTED', price);
  }
};

/**
 * Executa efetivamente a venda: credita conta corrente e atualiza carteira.
 */
const executeSell = async (userId, ticker, quantity, price, orderId = null) => {
  const user = await userRepository.findById(userId);
  const position = await portfolioRepository.findOne(userId, ticker);

  if (!position || position.quantity < quantity) {
    if (orderId) await orderRepository.updateStatus(orderId, 'CANCELLED');
    const err = new Error('Quantidade insuficiente em carteira para executar venda.');
    err.status = 400;
    throw err;
  }

  const totalValue = parseFloat((quantity * price).toFixed(2));
  const newBalance = parseFloat((parseFloat(user.balance) + totalValue).toFixed(2));
  await userRepository.update(userId, { balance: newBalance });

  // Atualiza carteira
  const newQty = position.quantity - quantity;
  if (newQty === 0) {
    await portfolioRepository.remove(userId, ticker);
  } else {
    await portfolioRepository.upsert(userId, ticker, newQty, position.avgBuyPrice);
  }

  // Lança crédito na conta corrente
  await transactionRepository.create({
    userId,
    type: 'DEPOSIT',
    amount: totalValue,
    description: `Venda de ${quantity}x ${ticker} a R$ ${price.toFixed(2)}`,
    balanceAfter: newBalance,
    simulationMinute: user.simulationMinute,
  });

  if (orderId) {
    await orderRepository.updateStatus(orderId, 'EXECUTED', price);
  }
};

module.exports = { getPortfolio, buyStock, sellStock, executeBuy, executeSell };

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { syncDatabase, User, UserStock, Transaction } = require('../src/models');
const marketService = require('../src/services/marketService');

const reset = process.argv.includes('--reset');

const run = async () => {
  if (reset) {
    const { sequelize } = require('../src/models');
    await sequelize.drop();
    console.log('Banco de dados removido.');
  }

  await syncDatabase();

  // Cria usuário de demonstração
  const email = 'demo@corretora.com';
  const exists = await User.findOne({ where: { email } });

  if (exists) {
    console.log('Usuário demo já existe. Pulando seed.');
    process.exit(0);
  }

  const password = await bcrypt.hash('senha123', 12);
  const initialBalance = parseFloat(process.env.INITIAL_BALANCE || '10000');

  const user = await User.create({ name: 'Usuário Demo', email, password, balance: initialBalance });

  // Seleciona 10 ações aleatórias
  try {
    const tickers = await marketService.fetchTickers();
    const shuffled = tickers.sort(() => Math.random() - 0.5).slice(0, 10);
    await UserStock.bulkCreate(shuffled.map((t) => ({ userId: user.id, ticker: t.ticker })));
    console.log(`Watchlist criada com ${shuffled.length} ações.`);
  } catch (err) {
    console.warn('Aviso: não foi possível buscar tickers do mercado.', err.message);
  }

  // Lança depósito inicial
  await Transaction.create({
    userId: user.id,
    type: 'DEPOSIT',
    amount: initialBalance,
    description: 'Depósito inicial',
    balanceAfter: initialBalance,
    simulationMinute: 0,
  });

  console.log(` Seed concluído.`);
  console.log(`   Email: ${email}`);
  console.log(`   Senha: senha123`);
  console.log(`   Saldo: R$ ${initialBalance.toFixed(2)}`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});

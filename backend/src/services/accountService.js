const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
const { formatSimulationTime } = require('../utils/validators');

/**
 * Retorna o extrato completo da conta corrente do usuário.
 */
const getStatement = async (userId) => {
  const transactions = await transactionRepository.findAllByUser(userId);

  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount),
    description: t.description,
    balanceAfter: parseFloat(t.balanceAfter),
    simulationTime: formatSimulationTime(t.simulationMinute),
    simulationMinute: t.simulationMinute,
    createdAt: t.createdAt,
  }));
};

const deposit = async (userId, description, amount) => {
  const user = await userRepository.findById(userId);
  const newBalance = parseFloat((parseFloat(user.balance) + amount).toFixed(2));

  await userRepository.update(userId, { balance: newBalance });

  const transaction = await transactionRepository.create({
    userId,
    type: 'DEPOSIT',
    amount,
    description,
    balanceAfter: newBalance,
    simulationMinute: user.simulationMinute,
  });

  return { balance: newBalance, transaction };
};

const withdraw = async (userId, description, amount) => {
  const user = await userRepository.findById(userId);

  if (parseFloat(user.balance) < amount) {
    const err = new Error('Saldo insuficiente para a retirada.');
    err.status = 400;
    throw err;
  }

  const newBalance = parseFloat((parseFloat(user.balance) - amount).toFixed(2));

  await userRepository.update(userId, { balance: newBalance });

  const transaction = await transactionRepository.create({
    userId,
    type: 'WITHDRAWAL',
    amount,
    description,
    balanceAfter: newBalance,
    simulationMinute: user.simulationMinute,
  });

  return { balance: newBalance, transaction };
};

module.exports = { getStatement, deposit, withdraw };

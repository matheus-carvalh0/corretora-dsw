const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const userStockRepository = require('../repositories/userStockRepository');
const transactionRepository = require('../repositories/transactionRepository');
const { generateToken } = require('../config/jwt');
const marketService = require('./marketService');

const SALT_ROUNDS = 12;

/**
 * Cadastra novo usuário, seleciona 10 ações aleatórias e cria depósito inicial.
 */
const register = async ({ name, email, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('E-mail já cadastrado.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const initialBalance = parseFloat(process.env.INITIAL_BALANCE || '10000');

  const user = await userRepository.create({ name, email, password: hashed, balance: initialBalance });

  // Seleciona 10 ações aleatórias do mercado para a watchlist inicial
  try {
    const tickers = await marketService.fetchTickers();
    const shuffled = tickers.sort(() => Math.random() - 0.5).slice(0, 10);
    const items = shuffled.map((t) => ({ userId: user.id, ticker: t.ticker }));
    await userStockRepository.bulkCreate(items);
  } catch (_) {
    // Falha ao buscar tickers não deve impedir cadastro
  }

  // Lança depósito inicial na conta corrente
  await transactionRepository.create({
    userId: user.id,
    type: 'DEPOSIT',
    amount: initialBalance,
    description: 'Depósito inicial',
    balanceAfter: initialBalance,
    simulationMinute: 0,
  });

  const token = generateToken({ id: user.id, email: user.email });
  return { token, user: sanitize(user) };
};

/**
 * Autentica o usuário e retorna JWT.
 */
const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, email: user.email });
  return { token, user: sanitize(user) };
};

/**
 * Gera token de recuperação de senha (válido por 1 hora).
 * Em produção, este token seria enviado por e-mail.
 * Para fins acadêmicos, retornamos diretamente no response.
 */
const forgotPassword = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  // Mesmo que o usuário não exista, não revelamos isso (segurança)
  if (!user) return { message: 'Se o e-mail existir, você receberá as instruções.' };

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await userRepository.update(user.id, { resetToken, resetTokenExpires });

  return {
    message: 'Token de recuperação gerado.',
    resetToken, // Em produção: enviar por e-mail, não retornar aqui
  };
};

/**
 * Redefine a senha usando o token de recuperação.
 */
const resetPassword = async ({ resetToken, newPassword }) => {
  const user = await userRepository.findByResetToken(resetToken);
  if (!user) {
    const err = new Error('Token inválido ou expirado.');
    err.status = 400;
    throw err;
  }

  if (new Date() > new Date(user.resetTokenExpires)) {
    const err = new Error('Token expirado. Solicite um novo.');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(user.id, { password: hashed, resetToken: null, resetTokenExpires: null });

  return { message: 'Senha redefinida com sucesso.' };
};

/**
 * Troca a senha do usuário autenticado.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userRepository.findById(userId);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    const err = new Error('Senha atual incorreta.');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(userId, { password: hashed });

  return { message: 'Senha alterada com sucesso.' };
};

/** Remove dados sensíveis do objeto usuário. */
const sanitize = (user) => {
  const { password, resetToken, resetTokenExpires, ...safe } = user.toJSON ? user.toJSON() : user;
  return safe;
};

module.exports = { register, login, forgotPassword, resetPassword, changePassword };

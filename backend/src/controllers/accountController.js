const { body } = require('express-validator');
const accountService = require('../services/accountService');
const userRepository = require('../repositories/userRepository');
const { success } = require('../utils/response');
const { validate } = require('../utils/validators');

const depositRules = [
  body('description').trim().notEmpty().withMessage('Descrição obrigatória.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo.'),
];

const withdrawRules = [
  body('description').trim().notEmpty().withMessage('Descrição obrigatória.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo.'),
];

const getStatement = async (req, res, next) => {
  try {
    const transactions = await accountService.getStatement(req.user.id);
    const user = await userRepository.findById(req.user.id);
    return success(res, {
      balance: parseFloat(user.balance),
      transactions,
    });
  } catch (err) { next(err); }
};

const deposit = async (req, res, next) => {
  try {
    validate(req);
    const { description, amount } = req.body;
    const result = await accountService.deposit(req.user.id, description, parseFloat(amount));
    return success(res, result, 'Depósito realizado com sucesso.');
  } catch (err) { next(err); }
};

const withdraw = async (req, res, next) => {
  try {
    validate(req);
    const { description, amount } = req.body;
    const result = await accountService.withdraw(req.user.id, description, parseFloat(amount));
    return success(res, result, 'Retirada realizada com sucesso.');
  } catch (err) { next(err); }
};

module.exports = { getStatement, depositRules, deposit, withdrawRules, withdraw };

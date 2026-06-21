const { body } = require('express-validator');
const authService = require('../services/authService');
const { validate } = require('../utils/validators');
const { success, created } = require('../utils/response');

// Validações reutilizáveis
const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter no mínimo 2 caracteres.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').notEmpty().withMessage('Senha obrigatória.'),
];

const register = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.register(req.body);
    return created(res, result, 'Usuário cadastrado com sucesso.');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.login(req.body);
    return success(res, result, 'Login realizado com sucesso.');
  } catch (err) { next(err); }
};

// Logout é stateless com JWT — orientação ao cliente para descartar o token
const logout = (_req, res) => {
  return success(res, {}, 'Logout realizado. Descarte o token no cliente.');
};

const forgotPassword = async (req, res, next) => {
  try {
    body('email').isEmail().withMessage('E-mail inválido.');
    validate(req);
    const result = await authService.forgotPassword(req.body);
    return success(res, result);
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.resetPassword(req.body);
    return success(res, result);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    validate(req);
    const result = await authService.changePassword(req.user.id, req.body);
    return success(res, result);
  } catch (err) { next(err); }
};

module.exports = { register, registerRules, login, loginRules, logout, forgotPassword, resetPassword, changePassword };

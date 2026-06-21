const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', authController.registerRules, authController.register);
router.post('/login',    authController.loginRules,    authController.login);
router.post('/logout',   authMiddleware,               authController.logout);

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
], authController.forgotPassword);

router.post('/reset-password', [
  body('resetToken').notEmpty().withMessage('Token obrigatório.'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres.'),
], authController.resetPassword);

router.post('/change-password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('Senha atual obrigatória.'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres.'),
], authController.changePassword);

module.exports = router;

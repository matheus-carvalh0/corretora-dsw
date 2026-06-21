/**
 * Middleware de tratamento global de erros.
 * Deve ser registrado como último middleware no app.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Erro de validação.', errors });
  }

  // Erro de validação do express-validator (lançado manualmente)
  if (err.status === 400 && err.errors) {
    return res.status(400).json({ success: false, message: err.message, errors: err.errors });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Erro interno do servidor.';

  return res.status(status).json({ success: false, message });
};

module.exports = errorHandler;

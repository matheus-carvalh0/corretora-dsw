const { validationResult } = require('express-validator');

/**
 * Extrai os erros de validação do express-validator e os retorna formatados.
 * Deve ser chamado no início de cada controller que usa validação.
 */
const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    const err = new Error('Dados inválidos.');
    err.status = 400;
    err.errors = formatted;
    throw err;
  }
};

/**
 * Formata o horário da simulação a partir do minuto atual.
 * Minuto 0 = 14:00, Minuto 59 = 14:59.
 */
const formatSimulationTime = (minute) => {
  const baseHour = parseInt(process.env.SIMULATION_START_HOUR || '14', 10);
  const totalMinutes = baseHour * 60 + minute;
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

module.exports = { validate, formatSimulationTime };

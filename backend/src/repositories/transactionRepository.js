const { Transaction } = require('../models');

const findAllByUser = (userId) =>
  Transaction.findAll({ where: { userId }, order: [['createdAt', 'ASC']] });

const create = (data) =>
  Transaction.create(data);

module.exports = { findAllByUser, create };

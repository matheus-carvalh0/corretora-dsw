const { Op } = require('sequelize');
const { Order } = require('../models');

const findAllByUser = (userId) =>
  Order.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });

const findPendingByUser = (userId) =>
  Order.findAll({ where: { userId, status: 'PENDING' }, order: [['createdAt', 'ASC']] });

const findById = (id) =>
  Order.findByPk(id);

const create = (data) =>
  Order.create(data);

const updateStatus = (id, status, executedPrice = null) =>
  Order.update(
    { status, executedPrice, executedAt: status === 'EXECUTED' ? new Date() : null },
    { where: { id } }
  );

const cancel = (id, userId) =>
  Order.update({ status: 'CANCELLED' }, { where: { id, userId, status: 'PENDING' } });

module.exports = { findAllByUser, findPendingByUser, findById, create, updateStatus, cancel };

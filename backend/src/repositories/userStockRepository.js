const { UserStock } = require('../models');

const findAllByUser = (userId) =>
  UserStock.findAll({ where: { userId } });

const findOne = (userId, ticker) =>
  UserStock.findOne({ where: { userId, ticker } });

const create = (userId, ticker) =>
  UserStock.create({ userId, ticker });

const bulkCreate = (items) =>
  UserStock.bulkCreate(items, { ignoreDuplicates: true });

const remove = (userId, ticker) =>
  UserStock.destroy({ where: { userId, ticker } });

const countByUser = (userId) =>
  UserStock.count({ where: { userId } });

module.exports = { findAllByUser, findOne, create, bulkCreate, remove, countByUser };

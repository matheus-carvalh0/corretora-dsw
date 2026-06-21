const { User } = require('../models');

const findById = (id) =>
  User.findByPk(id);

const findByEmail = (email) =>
  User.findOne({ where: { email } });

const findByResetToken = (token) =>
  User.findOne({ where: { resetToken: token } });

const create = (data) =>
  User.create(data);

const update = (id, data) =>
  User.update(data, { where: { id } });

module.exports = { findById, findByEmail, findByResetToken, create, update };

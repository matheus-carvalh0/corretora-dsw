const orderRepository = require('../repositories/orderRepository');
const { success, noContent } = require('../utils/response');

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderRepository.findPendingByUser(req.user.id);
    return success(res, { orders });
  } catch (err) { next(err); }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await orderRepository.findHistoryByUser(req.user.id);
    return success(res, { orders });
  } catch (err) { next(err); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const affected = await orderRepository.cancel(parseInt(req.params.id), req.user.id);
    if (!affected[0]) {
      const err = new Error('Ordem não encontrada ou já finalizada.');
      err.status = 404;
      throw err;
    }
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { getOrders, getOrderHistory, cancelOrder };

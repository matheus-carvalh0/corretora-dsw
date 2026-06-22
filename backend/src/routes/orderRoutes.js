const router = require('express').Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/',          orderController.getOrders);
router.get('/history',   orderController.getOrderHistory);
router.delete('/:id',    orderController.cancelOrder);

module.exports = router;

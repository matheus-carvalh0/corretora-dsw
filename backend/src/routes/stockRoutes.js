const router = require('express').Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/',             stockController.getStocks);
router.post('/',            stockController.addStockRules, stockController.addStock);
router.delete('/:ticker',   stockController.removeStock);

module.exports = router;

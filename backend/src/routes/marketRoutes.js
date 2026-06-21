const router = require('express').Router();
const marketController = require('../controllers/marketController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/',                   marketController.getMarket);
router.get('/tickers',            marketController.getTickers);
router.post('/advance-minute',    marketController.advanceMinute);
router.post('/advance-five-minutes', marketController.advanceFiveMinutes);

module.exports = router;

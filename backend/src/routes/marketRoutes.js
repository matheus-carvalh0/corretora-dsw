const router = require('express').Router();
const marketController = require('../controllers/marketController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/',                   marketController.getMarket);
router.get('/time',               marketController.getTime);
router.get('/tickers',            marketController.getTickers);
router.post('/advance-time',      marketController.advanceTimeRules, marketController.advanceTime);

module.exports = router;

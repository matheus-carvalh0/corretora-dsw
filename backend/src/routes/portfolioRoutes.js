const router = require('express').Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/',          portfolioController.getPortfolio);
router.post('/buy',      portfolioController.buyRules,  portfolioController.buyStock);
router.post('/sell',     portfolioController.sellRules, portfolioController.sellStock);

module.exports = router;

const router = require('express').Router();

router.use('/auth',      require('./authRoutes'));
router.use('/market',    require('./marketRoutes'));
router.use('/stocks',    require('./stockRoutes'));
router.use('/portfolio', require('./portfolioRoutes'));
router.use('/orders',    require('./orderRoutes'));
router.use('/account',   require('./accountRoutes'));
router.use('/user',      require('./userRoutes'));

module.exports = router;

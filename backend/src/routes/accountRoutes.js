const router = require('express').Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);
router.get('/', accountController.getStatement);
router.post('/deposit', accountController.depositRules, accountController.deposit);
router.post('/withdraw', accountController.withdrawRules, accountController.withdraw);

module.exports = router;

const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);
router.get('/me', userController.getMe);

module.exports = router;

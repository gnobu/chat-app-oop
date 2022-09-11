const router = require('express').Router();

const { Auth, registerUser, authUser, sendSignature, allUsers } = require('../controllers/user.controller');
const { protect, validatePic } = require('../middleware/auth.middleware');

const { DBService } = require('../services/db.service');

const auth = new Auth(new DBService());

router.get('/get-signature', auth.sendSignature);
router.post('/', validatePic, auth.registerUser);
router.get('/', protect, auth.allUsers);
router.post('/login', auth.authUser);

module.exports = router;
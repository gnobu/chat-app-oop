const router = require('express').Router();

const { protect } = require('../middleware/auth.middleware');
const { Message } = require('../controllers/message.controller');
const { DBService } = require('../services/db.service');

const message = new Message(new DBService());

router.post('/', protect, message.sendMessage);
router.get('/:chatId', protect, message.allMessages);

module.exports = router;
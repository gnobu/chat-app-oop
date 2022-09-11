const router = require('express').Router();
const { Chat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { DBService } = require('../services/db.service');

const chat = new Chat(new DBService());

router.post('/', protect, chat.accessChat);
router.get('/', protect, chat.fetchChats);
router.post('/group', protect, chat.createGroupChat);
router.put('/rename', protect, chat.renameGroup);
router.put('/groupadd', protect, chat.addToGroup);
router.put('/groupremove', protect, chat.removeFromGroup);

module.exports = router;
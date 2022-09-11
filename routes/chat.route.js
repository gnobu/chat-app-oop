const router = require('express').Router();
const { Chat, accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { DBService } = require('../services/db.service');

const chat = new Chat(new DBService());

router.post('/', protect, chat.accessChat);
router.get('/', protect, chat.fetchChats);
router.post('/group', protect, chat.createGroupChat);
// router.put('/rename', protect, renameGroup);
// router.put('/groupremove', protect, removeFromGroup);
// router.put('/groupadd', protect, addToGroup);

module.exports = router;
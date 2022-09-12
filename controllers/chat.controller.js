const expressAsyncHandler = require("express-async-handler");

class Chat {
    constructor(persistenceService) {
        this.persistenceService = persistenceService;
    }

    accessChat = expressAsyncHandler(async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            console.log("UserId param not sent with request");
            return res.sendStatus(400);
        }

        let foundChat = await this.persistenceService.accessSingleChat(req.user._id, userId)

        if (foundChat.length > 0) {
            res.send(foundChat[0]);
        } else {
            try {
                const newChat = await this.persistenceService.createSingleChat(req.user._id, userId)
                res.status(200).json(newChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
    });

    fetchChats = expressAsyncHandler(async (req, res) => {
        try {
            let allChats = await this.persistenceService.fetchChats(req.user._id);

            res.send(allChats);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    });

    createGroupChat = expressAsyncHandler(async (req, res) => {
        if (!req.body.users || !req.body.name) {
            res.status(400).send('Please fill all the fields.');
        }
        let users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).send('More than 2 users are required to form a group chat');
        }

        users.push(req.user._id);

        try {
            const fullGroupChat = await this.persistenceService.createGroupChat(req.body.name, users, req.user._id);

            res.status(200).send(fullGroupChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    });
    
    renameGroup = expressAsyncHandler(async (req, res) => {
        const { chatId, chatName } = req.body;
        
        const updatedChat = await this.persistenceService.renameGroupChat(chatId, chatName);
    
        if (!updatedChat) {
            res.status(404);
            throw new Error('Chat Not Found');
        } else {
            res.json(updatedChat);
        }
    });
    
    addToGroup = expressAsyncHandler(async (req, res) => {
        const { chatId, userId } = req.body;
    
        const added = await this.persistenceService.addToGroupChat(chatId, userId);
    
        if (!added) {
            res.status(404);
            throw new Error('Chat Not Found');
        } else {
            res.json(added);
        }
    });
    
    removeFromGroup = expressAsyncHandler(async (req, res) => {
        const { chatId, userId } = req.body;
    
        const removed = await this.persistenceService.removeFromGroupChat(chatId, userId);
    
        if (!removed) {
            res.status(404);
            throw new Error('Chat Not Found');
        } else {
            res.json(removed);
        }
    });
}

module.exports = { Chat };
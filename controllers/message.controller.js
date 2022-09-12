const expressAsyncHandler = require("express-async-handler");


class Message {
    constructor(persistenceService) {
        this.persistenceService = persistenceService;
    }

    sendMessage = expressAsyncHandler(async (req, res) => {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            console.log('Invalid data passed in request');
            return res.sendStatus(400);
        }

        try {
            const message = await this.persistenceService.createNewMessage(content, chatId, req.user._id)

            res.json(message);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    });

    allMessages = expressAsyncHandler(async (req, res) => {
        try {
            const messages = await this.persistenceService.fetchMessages(req.params.chatId);

            res.json(messages);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    })
}

module.exports = { Message };
const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

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
}











const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    let foundChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    foundChat = await User.populate(foundChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (foundChat.length > 0) {
        res.send(foundChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
    try {
        let allChats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate('groupAdmin', '-password -__v').populate('users', '-password -__v').populate('latestMessage').sort({ updatedAt: -1 });

        allChats = await User.populate(allChats, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.send(allChats);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        res.status(400).send('Please fill all the fields.');
    }
    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send('More than 2 users are required to form a group chat');
    }

    users.push(req.user._id);

    try {
        let groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).send(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!updatedChat) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(updatedChat);
    }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!added) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(added);
    }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    if (!removed) {
        res.status(404);
        throw new Error('Chat Not Found');
    } else {
        res.json(removed);
    }
});

module.exports = { Chat, accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
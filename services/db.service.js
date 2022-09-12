const User = require('../models/user.model');
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

class DBService {
    async getUserByMail(email) {
        const user = await User.findOne({ email });

        if (user) return user;

        return false;
    }

    async createUser({ name, email, password, pic }) {
        const user = await User.create({
            name,
            email,
            password,
            pic,
        })
        return user;
    }

    async getUserById(id) {
        const user = await User.findById(id).select("-password");
        return user;
    }

    async getAllUsers(search, options) {
        const keyword = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ]
        } : {};

        if (options.except) {
            const users = await User.find(keyword).find({ _id: { $ne: options.except } });
            return users;
        } else {
            const users = await User.find(keyword);
            return users;
        }
    }

    async authenticate(email, password) {
        const user = await this.getUserByMail(email);

        if (user && (await user.matchPassword(password))) {
            return user;
        } else {
            return false;
        }
    }

    async accessSingleChat(userId, otherUserId) {
        try {
            let chat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: otherUserId } } },
                    { users: { $elemMatch: { $eq: userId } } },
                ],
            }).populate("users", "-password").populate("latestMessage");

            chat = await User.populate(chat, {
                path: "latestMessage.sender",
                select: "name pic email",
            });

            return chat;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createSingleChat(userId, otherUserId) {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [userId, otherUserId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            return fullChat;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async fetchChats(userId) {
        try {
            let allChats = await Chat.find({ users: { $elemMatch: { $eq: userId } } }).populate('groupAdmin', '-password -__v').populate('users', '-password -__v').populate('latestMessage').sort({ updatedAt: -1 });

            allChats = await User.populate(allChats, {
                path: "latestMessage.sender",
                select: "name pic email",
            });

            return allChats;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createGroupChat(chatName, users, userId) {
        let groupChat = await Chat.create({
            chatName: chatName,
            users: users,
            isGroupChat: true,
            groupAdmin: userId,
        });

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        return fullGroupChat;
    }

    async renameGroupChat(chatId, chatName) {
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        return updatedChat;
    }

    async addToGroupChat(chatId, userId) {
        const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        return added;
    }

    async removeFromGroupChat(chatId, userId) {
        const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        return removed;
    }

    async createNewMessage(content, chatId, userId) {
        const newMessage = {
            sender: userId,
            content,
            chat: chatId
        }
        let message = await Message.create(newMessage);

        message = await message.populate('sender', 'name pic');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        return message;
    }

    async fetchMessages(chatId) {
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name pic email')
            .populate('chat');

        return messages;
    }
}

module.exports = { DBService };
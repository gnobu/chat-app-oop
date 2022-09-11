const User = require('../models/user.model');

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
}

module.exports = { DBService };
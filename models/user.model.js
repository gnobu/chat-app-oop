const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
        p_id: { type: String, default: "nceyxs5eeov6mnv65fa3" },
        version: { type: String, default: "1660898522" }
    }
}, { timestamps: true });

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);
module.exports = User;
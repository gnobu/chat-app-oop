const jwt = require('jsonwebtoken');

class JWTService {
    // maxAge = 3 * 24 * 60 * 60; // 3 days
    static generateToken = (payload, expiresIn = 3 * 24 * 60 * 60) => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    }

    static verifyToken(payload) {
        try {
            //decodes token id
            const decoded = jwt.verify(payload, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error("Not authorized, token failed.");
        }
    }
}


module.exports = { JWTService };
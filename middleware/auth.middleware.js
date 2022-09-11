const expressAsyncHandler = require("express-async-handler");
const { DBService } = require("../services/db.service");
const { JWTService } = require("../services/jwt.service");
const { ObjectDistService } = require("../services/objectDist.service");

const protect = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            //decodes token id
            const decoded = JWTService.verifyToken(token);

            // Get the user details from DB
            const dbService = new DBService();
            req.user = await dbService.getUserById(decoded.id)

            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed.");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token.");
    }
});

const validatePic = expressAsyncHandler(async (req, res, next) => {
    if (!req.body.pic) {
        next();
    } else {
        const { public_id, version, signature } = req.body.pic;

        if (!public_id || !version || !signature) {
            res.status(401);
            throw new Error("Not authorized, incomplete credentials.");
        }

        const distService = new ObjectDistService();

        if (distService.validatedSignature({ public_id, version }, signature)) {
            next();
        } else {
            res.status(401);
            throw new Error("Not authorized, bad signature.");
        }
    }
})


module.exports = { protect, validatePic };
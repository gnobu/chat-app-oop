const expressAsyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');
const { ObjectDistService } = require("../services/objectDist.service");
const { JWTService } = require("../services/jwt.service");

class Auth {
    constructor(persistenceService) {
        this.persistenceService = persistenceService;
    }

    sendSignature = expressAsyncHandler((req, res) => {
        const timestamp = Math.round(Date.now() / 1000) - (55 * 60);
        const signatureObject = new ObjectDistService().createSignature(timestamp);
        res.json(signatureObject)
    });

    registerUser = expressAsyncHandler(async (req, res) => {
        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please enter all the fields');
        }

        const userExists = this.persistenceService.getUserByMail(email);

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = this.persistenceService.createUser({
            name,
            email,
            password: hashedPassword,
            pic: { p_id: pic?.public_id, version: pic?.version },
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: JWTService.generateToken({ id: user._id.toString() }),
            });
        } else {
            res.status(400);
            throw new Error('Failed to create the User');
        }
    });

    // /api/user?search=user'sname
    allUsers = expressAsyncHandler(async (req, res) => {
        const queryOptions = { except: req.user._id };
        const users = await this.persistenceService.getAllUsers(req.query.search, queryOptions);

        res.send(users);
    });

    authUser = expressAsyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // const user = await User.findOne({ email });
        const user = await this.persistenceService.authenticate(email, password);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: JWTService.generateToken({ id: user._id.toString() }),
            });
        } else {
            res.status(401);
            throw new Error('Invalid Email or password');
        }
    })
}



module.exports = { Auth };
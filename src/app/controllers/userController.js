const express = require('express');
const authMiddleware = require('../middleware/auth');

const User = require('../models/User');
const authConfig = require('../../config/auth');

const router = express.Router();

router.use(authMiddleware);

function generetionToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

router.get('/', async (req, res) => {
    const users = await User.find();

    res.status(200).send({users});
});

router.post('/register', async (req, res) => {
    let { name, email, password, confirmPassword } = req.body;

    if (await User.findOne({email})) {
        return res.status(400).json({error: 'User already exists'});
    }

    if(password !== confirmPassword)
        return res.status(400).send({ error: 'Different password' });

    const encryptedPassword = await bcrypt.hash(password, 10);
    password = encryptedPassword
    
    try {
        const user = await User.create({
            name,
            email,
            password,
        });

        return res.status(201).json({
            user,
            token: generetionToken({ id : user.id })
        });

    } catch(err) {
        return res.status(400).json({ error : 'Registration falied' })
    }
});

module.exports = app => app.use('/users', router);
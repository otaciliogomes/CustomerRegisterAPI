const bcrypt = require('bcryptjs');
const { Router } = require("express");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth');

const router = Router();

function generetionToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

router.post('/register', async (req, res) => {
    let { name, email, password } = req.body;

    if (await User.findOne({email})) {
        return res.status(400).json({error: 'User already exists'});
    }

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

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email}).select('+password');
    if(!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    if(!await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ error: 'Incorrect password' });
    }

    user.password = undefined;

    res.json({ 
        user, 
        token: generetionToken({ id : user.id })
    })
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user)
            res.status(400).json({ error: 'User not found' })

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate( user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        } )

        
        mailer.sendMail({
            to: 'otaciliogsantos@gmail.com',
            from: 'otaciliogsantos@gmail.com',
            template: 'auth/forgot_password',
            context: { token }

        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email'})

            return res.status(200).send() 
        });
    } catch(err) {
        res.status(400).json({ error: 'Erro on forgot password, try agian'});
    }

})

router.post('/reset_password', async (req, res) => {
    let { email, token, password } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    password = encryptedPassword;
    
    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

        if(!user)
            return res.status(400).send({ error: 'User not found'});

        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid'});

        const now = Date.now();
        
        if(now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expires, generate a new one' });

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                password
            }
        });

        res.send()
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Cannot reset password, try again" })
    }
})

module.exports = app => app.use('/auth', router);
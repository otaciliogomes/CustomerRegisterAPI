const express = require('express');
const authMiddleware = require('../middleware/auth');

const User = require('../models/User');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    const users = await User.find();

    res.status(200).send({users});
});

module.exports = app => app.use('/users', router);
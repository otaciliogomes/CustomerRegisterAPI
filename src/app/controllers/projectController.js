const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (request, response) => {
    const users = await User.find()
    
    response.send({users})
});

module.exports = app => app.use('/project', router)
const express = require('express');
const authMiddleware = require('../middleware/auth');

const Task = require('../models/Task');

const router = express.Router();

router.get('/', async (req, res) => {
    const tasks = await Task.find();

    res.status(200).send({tasks});
});

module.exports = app => app.use('/tasks', router)
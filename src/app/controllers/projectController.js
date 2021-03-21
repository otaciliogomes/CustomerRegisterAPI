const express = require('express');
const authMiddleware = require('../middleware/auth');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');


const router = express.Router();

router.use(authMiddleware);


router.get('/', async (req, res) => {
   try{
    const projects = await Project.find().populate(['user', 'task']);

    res.status(200).send({projects})
   } catch(err) {
       return res.status(400).send({ error: 'Error loading projects'})
   }
});

router.get('/:projectId', async (req, res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate(['user', 'task']);
    
        res.status(200).send({project})
    } catch(err) {
        return res.status(400).send({ error: 'Error loading project'})
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body

        const project = await Project.create({ title, description, user: req.userId});

        await Promise.all(tasks.map( async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            
            project.task.push(projectTask);
        }));

        await project.save();

        res.status(201).send({project});
    } catch(err) {
        return res.status(400).send({ error: 'Error creating new project' });
    }
});

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body

        const project = await Project.findByIdAndUpdate(req.params.projectId, { 
            title, 
            description, 
            }, { new: true });

        project.task = [];
        await Task.deleteMany({project: project._id});

        await Promise.all(tasks.map( async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            
            project.task.push(projectTask);
        }));

        await project.save();

        res.status(201).send({project});
    } catch(err) {
        console.log(err)
        return res.status(400).send({ error: 'Error updateing new project' });
    }
});

router.delete('/:projectId', async (req, res) => {
    try{
        await Project.findByIdAndRemove(req.params.projectId);
    
        res.status(200).send({ menssage: 'Project deleted' })
    } catch(err) {
        return res.status(400).send({ error: 'Could not remove project'})
    }
});

module.exports = app => app.use('/project', router)
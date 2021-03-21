const mongoose = require('../../database');


const ProjectSchema = new mongoose.Schema({
 
 title: {
   type: String,
   require: true
 }, 
 description: {
    type: String,
    require: true
 }, 
 user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    require: true
 },
task: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
}],
 createdAt: {
   type: Date,
   default: Date.now
 }
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
const mongoose = require('../../database');


const UserSchema = new mongoose.Schema({
 
 name: {
   type: String,
   require: true

 },
 email: {
   type: String,
   unique: true,
   require: true,
   lowercase: true
 },
 password: {
   type: String,
   require: true,
   select: false
 },
 passwordResetToken: {
  type: String,
  select: false
 },
 passwordResetExpires: {
  type: Date,
  select: false
 },
 createdAt: {
   type: Date,
   default: Date.now
 }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
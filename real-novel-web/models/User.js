// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type:String, required:true, unique:true, trim:true },
  email:    { type:String, required:true, unique:true, trim:true, lowercase:true },
  password: { type:String, required:true },  // bcrypt hash stored here
  role:     { type:String, default:'user' },
  coins:    { type:Number, default:0 }
}, { timestamps:true });
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  role:{
    type: String,
    required:true
  },
  phoneNumber:{
    type:Number,
    required:true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', // Reference to the Employee model
    required: true,
  },
 
});

module.exports = mongoose.model('User', userSchema);

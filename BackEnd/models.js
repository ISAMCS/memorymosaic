// Import mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define User Schema to store user details
const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    profilePicture: String,
    people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
  });

const memorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    photo: { type: String, required: true },
    comments: [{ text: String, date: { type: Date, default: Date.now } }],
    date: { type: Date, default: Date.now }
  });
  
  const personSchema = new mongoose.Schema({
    name: String,
    profilePicture: String,
    memories: [memorySchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });

// Create models from schemas to interact with MongoDB collections
const User = mongoose.model('User', userSchema); // Model for User collection
const Memory = mongoose.model('Memory', memorySchema); // Model for Memory collection
const Person = mongoose.model('Person', personSchema);

// Export models to use in other parts of the application
module.exports = { User, Memory, Person };
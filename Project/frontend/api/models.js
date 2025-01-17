const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});

const memorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  photo: { type: String, required: true },
  comments: [commentSchema],
  date: { type: Date, default: Date.now }
});

const personSchema = new mongoose.Schema({
  name: String,
  profilePicture: String,
  memories: [memorySchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  profilePicture: String,
  people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
});

const User = mongoose.model('User', userSchema);
const Memory = mongoose.model('Memory', memorySchema);
const Person = mongoose.model('Person', personSchema);

module.exports = { User, Memory, Person };
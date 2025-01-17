import mongoose from 'mongoose';

// Define your schemas
const userSchema = new mongoose.Schema({
  // schema definition...
});

const memorySchema = new mongoose.Schema({
  // schema definition...
});

const personSchema = new mongoose.Schema({
  profilePicture: String,
  memories: [memorySchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

// Create models from schemas to interact with MongoDB collections
const User = mongoose.model("User", userSchema); // Model for User collection
const Memory = mongoose.model("Memory", memorySchema); // Model for Memory collection
const Person = mongoose.model("Person", personSchema);

// Export models to use in other parts of the application
export { User, Memory, Person };
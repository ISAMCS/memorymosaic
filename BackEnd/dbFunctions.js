// Import models to interact with database collections
const { User, Memory, Comment, Person } = require('./models');

// Function to handle Google login or user creation
// Ensures a user is created if they don't already exist in the database
async function handleGoogleLogin(googleProfile) {
    try {
        let user = await User.findOne({ googleId: googleProfile.id });
        if (!user) {
            user = new User({
                googleId: googleProfile.id, // Unique identifier from Google
                email: googleProfile.emails[0].value, // User's email address
                name: googleProfile.displayName, // User's name
                profilePicture: googleProfile.photos[0].value // Profile picture URL
            });
            await user.save(); // Save new user to the database
        }
        return user; // Return the existing or newly created user
    } catch (error) {
        console.error('Error handling Google login:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Function to fetch all people created by a user
// Takes the user's ID as input and returns an array of people
async function getPeopleByUserId(userId) {
    try {
        return await Person.find({ userId }); // Retrieve all people linked to the user
    } catch (error) {
        console.error('Error retrieving people:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Function to create a new person profile
// Accepts user ID, name, and profile picture URL, and returns the created person
async function createPerson(userId, name, profilePicture) {
    try {
        const person = new Person({ userId, name, profilePicture });
        await person.save(); // Save the new person in the database
        return person; // Return the created person
    } catch (error) {
        console.error('Error creating person:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Function to edit an existing person's details
// Takes the person ID and updates object as input
async function editPerson(personId, updates) {
    try {
        return await Person.findByIdAndUpdate(personId, updates, { new: true }); // Update person details
    } catch (error) {
        console.error('Error editing person:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Function to delete a person and associated data
// Deletes the person, their memories, and all comments on those memories
async function deletePerson(personId) {
    try {
        const memories = await Memory.find({ personId }); // Fetch memories linked to the person
        const memoryIds = memories.map(mem => mem._id); // Extract memory IDs
        await Memory.deleteMany({ personId }); // Delete the memories
        await Comment.deleteMany({ memoryId: { $in: memoryIds } }); // Delete associated comments
        return await Person.findByIdAndDelete(personId); // Delete the person
    } catch (error) {
        console.error('Error deleting person:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Function to delete a memory and its associated comments
// Takes the memory ID as input and ensures all comments tied to it are also deleted
async function deleteMemory(memoryId) {
    try {
        await Comment.deleteMany({ memoryId }); // Delete associated comments
        return await Memory.findByIdAndDelete(memoryId); // Delete the memory itself
    } catch (error) {
        console.error('Error deleting memory:', error);
        throw error; // Throw error to be handled by the caller
    }
}

// Export all functions to use them in other parts of the application
module.exports = {
    handleGoogleLogin,
    getPeopleByUserId,
    createPerson,
    editPerson,
    deletePerson,
    deleteMemory
};
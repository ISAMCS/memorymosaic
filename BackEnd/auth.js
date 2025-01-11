require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const User = require('./models');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Replace with your Google Client ID

const client = new OAuth2Client(CLIENT_ID);

// Function to verify ID token
async function verifyIdToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload(); // Contains user info
        const userId = payload['sub']; // Unique Google ID for the user
        return { userId, payload };
    } catch (error) {
        console.error('Error verifying ID token:', error);
        throw new Error('Invalid ID token');
    }
}

async function createUserFromPayload(payload) {
    try {
        // Create a new user document from the payload data
        const newUser = new User({
            googleId: payload.sub,  // Google ID (unique identifier)
            name: payload.name,      // User's full name
            email: payload.email,    // User's email
            picture: payload.picture // User's Google profile picture (optional)
        });

        // Save the new user to the database
        await newUser.save();

        return newUser;  // Return the saved user
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Error creating new user in the database');
    }
}

module.exports = { verifyIdToken, createUserFromPayload };
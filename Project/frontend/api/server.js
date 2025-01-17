import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { User, Memory, Person } from './models.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { put } from '@vercel/blob';

const app = express(); // Create an instance of the Express application
const port = process.FRONTEND_URL;
const upload = multer({ storage: multer.memoryStorage() });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

const mongoURI = process.env.MONGO_URI;

// Create a function to handle file uploads to Vercel Blob
async function uploadToVercelBlob(file) {
  const blob = await put(file.originalname, file.buffer, {
    access: 'public',
  });
  return blob;
}

// Use session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: `${BACKEND_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePhoto: profile.photos[0].value
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// In your route handler
const handleUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
    });

    const photo = blob.url;

    // Use the photo URL in your database or response
    // ...

    res.status(200).json({ message: 'File uploaded successfully', photo });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Apply authentication middleware to all /api routes
app.use('/api', isAuthenticated);

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Mongoose connection setup
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Routes
// Google authentication routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.post('/api/auth/token', async (req, res) => {
  const { code } = req.body;
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: 'https://memorymosaic-hl0r1vqky-isamcs-projects.vercel.app/auth/google/callback',
    grant_type: 'authorization_code'
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to exchange token' });
    }

    const data = await response.json();
    const idToken = data.id_token;
    const payload = await verifyGoogleIdToken(idToken);
    res.status(200).json({ payload });
  } catch (error) {
    res.status(401).json({ error: 'Invalid ID token' });
  }
});

app.get('/api/user-profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.user);
});

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect(`${FRONTEND_URL}/Profile`);
  } else {
    res.redirect('/auth/google');
  }
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.send('Welcome! <a href="/auth/google">Login with Google</a>');
  }
});

// Create a new person
app.post('/api/people', upload.single('photo'), async (req, res) => {
  const { name } = req.body;
  let photoUrl = null;

  if (req.file) {
    try {
      photoUrl = await uploadToVercelBlob(req.file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      return res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
  }
  const newPerson = new Person({
    name,
    photo: photoUrl,
    user: req.user._id
  });
  try {
    const savedPerson = await newPerson.save();
    console.log('Person created successfully:', savedPerson);
    res.status(201).json(savedPerson);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ message: 'Error creating person', error: error.message });
  }
});

app.delete('/api/people/:personId/memories/:memoryId', async (req, res) => {
  const { personId, memoryId } = req.params;

  try {
    const person = await Person.findOne({ _id: personId, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const memoryIndex = person.memories.findIndex(memory => memory._id.toString() === memoryId);
    if (memoryIndex === -1) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    person.memories.splice(memoryIndex, 1);
    await person.save();

    res.status(200).json(person);
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ message: 'Error deleting memory', error: error.message });
  }
});


// Delete a person
app.delete('/api/people/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    await person.remove();
    res.status(200).json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ message: 'Error deleting person', error: error.message });
  }
});

// Delete all people for the authenticated user
app.delete('/api/people', async (req, res) => {
  try {
    const result = await Person.deleteMany({ user: req.user._id });
    res.status(200).json({ message: `${result.deletedCount} people deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete people' });
  }
});

// Update a person's photo
app.put('/api/people/:id/photo', upload.single('photo'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }

  try {
    const photoUrl = await uploadToVercelBlob(req.file);

    const updatedPerson = await Person.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { profilePicture: photoUrl },
      { new: true }
    );

    if (!updatedPerson) {
      return res.status(404).json({ message: 'Person not found' });
    }

    res.status(200).json(updatedPerson);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Error updating profile picture', error });
  }
});

// Get all people for the authenticated user
app.get('/api/people', async (req, res) => {
  console.log('Received GET request to /api/people');
  try {
    const people = await Person.find({ user: req.user._id });
    res.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ message: 'Error fetching people', error: error.message });
  }
});

// Add a memory to a person
app.post('/api/people/:id/memories', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { title, comment } = req.body;
  let photoUrl = null;

  if (req.file) {
    try {
      photoUrl = await uploadToVercelBlob(req.file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      return res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
  }
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const newMemory = {
      title,
      photo,
      comments: comment ? [{ text: comment }] : []
    };

    person.memories.push(newMemory);
    await person.save();
    res.status(201).json(person);
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({ message: 'Error adding memory', error: error.message });
  }
});

// Add a comment to a memory
app.post('/api/people/:id/memories/:memoryId/comments', async (req, res) => {
  const { id, memoryId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const memory = person.memories.id(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.comments.push({ text });
    await person.save();
    res.status(201).json(memory);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error });
  }
});

// Update a memory
app.put('/api/people/:personId/memories/:memoryId', upload.single('photo'), async (req, res) => {
  const { personId, memoryId } = req.params;
  const { title, comment } = req.body;
  let photoUrl = null;

  if (req.file) {
    try {
      photoUrl = await uploadToVercelBlob(req.file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      return res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
  }
  try {
    const person = await Person.findOne({ _id: personId, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const memory = person.memories.id(memoryId);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.title = title;
    memory.comment = comment;
    if (photo) {
      memory.photo = photo;
    }

    await person.save();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ message: 'Error updating memory', error: error.message });
  }
});

export default app;
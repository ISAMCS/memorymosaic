import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fetch from 'node-fetch';
import { User, Memory, Person } from './models.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { put } from '@vercel/blob';
import http from 'http';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

const REDIRECT_URL = process.env.REDIRECT_URL;

const app = express();
const server = http.createServer(app);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const mongoURI = process.env.MONGO_URI;

async function uploadToVercelBlob(file) {
  const blob = await put(file.originalname, file.buffer, {
    access: 'public',
  });
  return blob;
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(self), microphone=()");
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: [FRONTEND_URL, BACKEND_URL],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

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

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + mongoURI);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const handleUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
    });

    const photo = blob.url;

    res.status(200).json({ message: 'File uploaded successfully', photo });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    message: 'Authentication required',
    redirectTo: '/api/auth/google'
  });
};

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

console.log('Mongo URI:', mongoURI);

app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/api/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.get('/api/user-profile', isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
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

app.post('/api/auth/token', async (req, res) => {
  const { code } = req.body;
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URL,
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

app.post('/api/people', upload.single('photo'), async (req, res) => {
  const { name } = req.body;
  let photoUrl = null;

  if (req.file) {
    try {
      const blob = await uploadToVercelBlob(req.file);
      photoUrl = blob.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
  }

  try {
    const newPerson = new Person({
      name,
      profilePicture: photoUrl,
      user: req.user._id
    });
    const savedPerson = await newPerson.save();
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

app.delete('/api/people', async (req, res) => {
  try {
    const result = await Person.deleteMany({ user: req.user._id });
    res.status(200).json({ message: `${result.deletedCount} people deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete people' });
  }
});

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

  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    const newMemory = {
      title,
      photo: photoUrl,
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
    if (photoUrl) {
      memory.photo = photoUrl;
    }

    await person.save();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ message: 'Error updating memory', error: error.message });
  }
});

app.put('/api/user-profile', async (req, res) => {
  try {
    const { id, comment, photo } = req.body;
    const person = await Person.findById(id);

    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    person.comment = comment;
    if (photo) {
      person.photo = photo;
    }

    await person.save();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
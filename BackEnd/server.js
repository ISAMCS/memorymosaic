require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const { User, Memory, Person } = require('./models.js');
const cors = require('cors');
const fs = require('fs');
const { put, del } = require('@vercel/blob');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const REDIRECT_URL = process.env.REDIRECT_URL;

app.use(cors({ origin: [FRONTEND_URL, BACKEND_URL], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });


// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const filename = Date.now() + path.extname(file.originalname);

    // Upload to Vercel Blob
    const { url } = await put(filename, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Apply authentication middleware to all /api routes
app.use('/', isAuthenticated);

// Mongoose connection setup
// Mongoose connection setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Google authentication routes

// Google OAuth2 client
passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: REDIRECT_URL
},
async (accessToken, refreshToken, profile, done) => {
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

// verify Google ID token
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

// Google OAuth2 client
app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
}));

// Google OAuth2 callback
app.get('/auth/callback/google', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Exchange Google auth code for ID token
app.post('/auth/token', async (req, res) => {
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

// Get user profile
app.get('/user-profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.user);
});

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    const host = req.headers.host.split(':')[0];
    res.redirect(`http://${host}:3001/Profile`);
  } else {
    res.redirect('/auth/google');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Default route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.send('Welcome! <a href="/auth/google">Login with Google</a>');
  }
});

// Create a new person
app.post('/people', upload.single('photo'), async (req, res) => {
  const { name } = req.body;
  let photo = null;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const { url } = await put(filename, req.file.buffer, { access: 'public' });
      photo = url;
    }

    const newPerson = new Person({
      name,
      profilePicture: photo,
      user: req.user._id
    });
    const savedPerson = await newPerson.save();
    console.log('Person created successfully:', savedPerson);
    res.status(201).json(savedPerson);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ message: 'Error creating person', error: error.message });
  }
});

// Delete a person
app.delete('/people/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPerson = await Person.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deletedPerson) {
      return res.status(404).json({ message: 'Person not found' });
    }
    if (deletedPerson.profilePicture) {
      await del(new URL(deletedPerson.profilePicture).pathname);
    }
    console.log('Person deleted successfully:', deletedPerson);
    res.status(200).json({ message: 'Person deleted successfully', deletedPerson });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ message: 'Error deleting person', error });
  }
});

// Update a person's photo
app.put('/people/:id/photo', upload.single('photo'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }

  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    if (person.profilePicture) {
      await del(new URL(person.profilePicture).pathname);
    }

    const filename = `${Date.now()}-${req.file.originalname}`;
    const { url } = await put(filename, req.file.buffer, { access: 'public' });

    const updatedPerson = await Person.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { profilePicture: url },
      { new: true }
    );

    res.status(200).json(updatedPerson);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Error updating profile picture', error });
  }
});

// Add a memory to a person
app.post('/people/:id/memories', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { title, comment } = req.body;
  let photo = null;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const person = await Person.findOne({ _id: id, user: req.user._id });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const { url } = await put(filename, req.file.buffer, { access: 'public' });
      photo = url;
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

// Update a memory
app.put('/people/:personId/memories/:memoryId', upload.single('photo'), async (req, res) => {
  const { personId, memoryId } = req.params;
  const { title, comment } = req.body;

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

    if (req.file) {
      if (memory.photo) {
        await del(new URL(memory.photo).pathname);
      }
      const filename = `${Date.now()}-${req.file.originalname}`;
      const { url } = await put(filename, req.file.buffer, { access: 'public' });
      memory.photo = url;
    }

    await person.save();
    res.status(200).json(person);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ message: 'Error updating memory', error: error.message });
  }
});


module.exports = app;
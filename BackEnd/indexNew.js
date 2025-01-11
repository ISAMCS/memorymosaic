const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3009; // Changed port to 3009

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/peopleDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Mongoose schemas and models
const commentSchema = new mongoose.Schema({
    text: String,
    date: { type: Date, default: Date.now }
});

const memorySchema = new mongoose.Schema({
    photo: String,
    date: { type: Date, default: Date.now }
});

const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePicture: { type: String, required: true },
    comments: [commentSchema],
    memories: [memorySchema]
});

const Person = mongoose.model('Person', personSchema);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve the uploads directory

app.post('/api/people', upload.single('photo'), async (req, res) => {
    console.log('Received POST request to /api/people');
    const { name } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name || !photo) {
        return res.status(400).json({ message: 'Name and photo are required' });
    }
    const newPerson = new Person({ name, profilePicture: photo });
    try {
        const savedPerson = await newPerson.save();
        console.log('Person created successfully:', savedPerson);
        res.status(201).json(savedPerson);
    } catch (error) {
        console.error('Error creating person:', error);
        res.status(500).json({ message: 'Error creating person', error });
    }
});

app.post('/api/people/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const person = await Person.findById(id);
        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }
        person.comments.push({ text });
        await person.save();
        res.status(201).json(person);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error });
    }
});

app.post('/api/people/:id/memories', upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const person = await Person.findById(id);
        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }
        person.memories.push({ photo });
        await person.save();
        res.status(201).json(person);
    } catch (error) {
        console.error('Error adding memory:', error);
        res.status(500).json({ message: 'Error adding memory', error });
    }
});

app.delete('/api/people/:id/memories/:memoryId', async (req, res) => {
    const { id, memoryId } = req.params;
    try {
        const person = await Person.findById(id);
        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }
        person.memories.id(memoryId).remove();
        await person.save();
        res.status(200).json(person);
    } catch (error) {
        console.error('Error deleting memory:', error);
        res.status(500).json({ message: 'Error deleting memory', error });
    }
});

app.get('/api/people', async (req, res) => {
    console.log('Received GET request to /api/people');
    try {
        const people = await Person.find();
        res.json(people);
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ message: 'Error fetching people', error });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
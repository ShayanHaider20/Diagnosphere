
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Express app setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://admin:admin@fyp.x57l7.mongodb.net/?retryWrites=true&w=majority&appName=FYP';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Diagnosis model
const diagnosisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  symptoms: Object,
  results: Object,
  createdAt: { type: Date, default: Date.now }
});

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

// JWT Secret
const JWT_SECRET = 'diagnosphere-secret-key'; // In production, this should be in environment variables

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and send token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get current user
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint (for completeness, though JWT invalidation on client-side is sufficient)
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Diagnosis routes
app.post('/api/diagnosis/upload', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Create a new diagnosis entry
    const diagnosis = new Diagnosis({
      user: req.userId,
      imageUrl,
    });
    
    diagnosis.save();
    
    res.json({
      diagnosisId: diagnosis._id,
      imageUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

app.post('/api/diagnosis/:id/symptoms', auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }
    
    if (diagnosis.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Save symptoms data
    diagnosis.symptoms = req.body;
    
    // Placeholder for ML model processing
    // In a real application, you would process the image and symptoms here
    
    // Simulate model results (in real app, this would come from TensorFlow.js)
    diagnosis.results = {
      predictions: [
        { name: 'Eczema', probability: 0.65 },
        { name: 'Psoriasis', probability: 0.20 },
        { name: 'Contact Dermatitis', probability: 0.15 },
      ],
      severity: 'Moderate',
      recommendations: [
        'Keep the affected area clean and dry',
        'Apply moisturizer regularly',
        'Avoid scratching or rubbing the affected area',
        'Consider over-the-counter hydrocortisone cream',
        'Consult a dermatologist if symptoms worsen'
      ]
    };
    
    await diagnosis.save();
    
    res.json({
      diagnosisId: diagnosis._id,
      results: diagnosis.results,
    });
  } catch (error) {
    console.error('Symptoms submission error:', error);
    res.status(500).json({ message: 'Server error during symptoms submission' });
  }
});

app.get('/api/diagnosis/:id/results', auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }
    
    if (diagnosis.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (!diagnosis.results) {
      return res.status(404).json({ message: 'No results available yet' });
    }
    
    res.json(diagnosis.results);
  } catch (error) {
    console.error('Results retrieval error:', error);
    res.status(500).json({ message: 'Server error during results retrieval' });
  }
});

app.get('/api/diagnosis/history', auth, async (req, res) => {
  try {
    const history = await Diagnosis.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('imageUrl symptoms results createdAt');
    
    res.json(history);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ message: 'Server error during history retrieval' });
  }
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

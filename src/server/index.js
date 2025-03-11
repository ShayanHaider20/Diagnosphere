
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://admin:admin@fyp.x57l7.mongodb.net/?retryWrites=true&w=majority&appName=FYP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define Diagnosis Schema
const DiagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  symptoms: {
    type: Object,
    default: {}
  },
  results: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const User = mongoose.model('User', UserSchema);
const Diagnosis = mongoose.model('Diagnosis', DiagnosisSchema);

// Configure JWT
const JWT_SECRET = 'diagnosphere-secret-key';
const EXPIRATION = '7d';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: EXPIRATION });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: EXPIRATION });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/user', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Client-side will handle token removal
  res.json({ message: 'Logged out successfully' });
});

// Diagnosis Routes
app.post('/api/diagnosis/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Create a new diagnosis record
    const diagnosis = new Diagnosis({
      userId: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`
    });
    
    await diagnosis.save();
    
    // In a real app, this is where you would call your ML model
    
    res.json({
      diagnosisId: diagnosis._id,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/diagnosis/:id/symptoms', auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }
    
    if (diagnosis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update symptoms
    diagnosis.symptoms = req.body;
    await diagnosis.save();
    
    // Mock results - in a real app, you would run your ML model here
    const mockResults = [
      {
        name: 'Eczema',
        probability: 75,
        description: 'A condition that makes your skin red and itchy.',
        nextSteps: [
          'Apply moisturizer regularly',
          'Avoid harsh soaps and detergents',
          'Consider seeing a dermatologist for prescription treatment'
        ]
      },
      {
        name: 'Contact Dermatitis',
        probability: 45,
        description: 'A red, itchy rash caused by direct contact with a substance or an allergic reaction.',
        nextSteps: [
          'Identify and avoid the irritant',
          'Apply anti-itch cream',
          'Take an oral antihistamine'
        ]
      }
    ];
    
    diagnosis.results = mockResults;
    await diagnosis.save();
    
    res.json({ message: 'Symptoms submitted successfully' });
  } catch (error) {
    console.error('Symptoms submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/diagnosis/:id/results', auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }
    
    if (diagnosis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      id: diagnosis._id,
      imageUrl: diagnosis.imageUrl,
      date: diagnosis.createdAt,
      conditions: diagnosis.results,
      symptoms: diagnosis.symptoms
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/diagnosis/history', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.json(diagnoses.map(diagnosis => ({
      id: diagnosis._id,
      imageUrl: diagnosis.imageUrl,
      date: diagnosis.createdAt,
      hasResults: diagnosis.results.length > 0
    })));
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

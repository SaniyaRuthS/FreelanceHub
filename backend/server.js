const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

// Configure dotenv
dotenv.config();

// Initialize express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Main App Routes
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);

// Database Test Route (Requirement #4)
app.get('/test-insert', async (req, res) => {
  try {
    const sampleUser = await User.create({
      name: 'Test user',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });
    res.status(201).json({
      message: 'Test success: User inserted into MongoDB',
      user: sampleUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root / Health Check
app.get('/', (req, res) => {
  res.send('Freelancer Hub API is running...');
});

const PORT = process.env.PORT || 3001;

// Connect to database before starting server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB. Check your MONGO_URI.');
});

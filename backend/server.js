const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');

// Configure dotenv
dotenv.config();

// Initialize express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main App Routes
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const gigRoutes = require('./routes/gigRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const demoRoutes = require('./routes/demoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/demo', demoRoutes);

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

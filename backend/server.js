import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// NM Routes import
import authRoutes from './routes/authRoutes.js';
import jobRoutes from '../backend/routes/NM/jobRoutes.js'
import appliRoutes from '../backend/routes/NM/appliRoutes.js'

import concernRoutes from '../backend/routes/NM/concernRoutes.js'

// Maple Routes import
import appoRoutes from '../backend/routes/Maple/AppoRoutes.js'
import sampleRoutes from '../backend/routes/Maple/sampleRoutes.js'


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Upload middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());                          //  Cross-origin requests
app.use(express.json());                  //  JSON API requests
app.use(express.urlencoded({ extended: true })); // HTML form submissions
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes NM
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', appliRoutes);
app.use('/api/concerns', concernRoutes);

// Protected Routes Maple
app.use('/api/appointments', appoRoutes);
app.use('/api/samples', sampleRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Authentication API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const businessRoutes = require('./routes/businessRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration - allow requests from Vite dev server and standard frontend origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'https://easyaudit.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'easy_audit_secret_key_123',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easy_audit',
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false, // Set to true in production if using https
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes on root to preserve endpoint naming conventions
app.use('/', authRoutes);
app.use('/', customerRoutes);
app.use('/', businessRoutes);
app.use('/', transactionRoutes);
app.use('/', notificationRoutes);
app.use('/', messageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(500).send('Something broke on the server!');
});

// Start the unified backend
app.listen(port, () => {
  console.log(`Unified EasyAudit Server is running on port ${port}`);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const employeeRoutes = require('./routes/employee_routes');
const leaveRoutes = require('./routes/leaveRoutes');
const taskRoutes = require('./routes/task_routes');
const userRoutes = require('./routes/User_router');
const notificationRoutes = require('./routes/notification_routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.use('/employees', employeeRoutes);
app.use('/leaves', leaveRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes)
app.use('/notifications', notificationRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Add bcrypt for hashing
const jwt = require('jsonwebtoken'); // Add jwt for token generation
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct

router.post('/signup', async (req, res) => {
  const { username, role, email, phoneNumber, password, employeeId } = req.body;

  // Validate if all fields are provided
  if (!username || !role || !email || !phoneNumber || !password || !employeeId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the employee exists
    const employee = await mongoose.model('Employee').findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if a user already exists for this employee
    const existingUser = await User.findOne({ employee: employeeId });
    if (existingUser) {
      return res.status(400).json({ error: 'User account already exists for this employee' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      username,
      role,
      email,
      phoneNumber,
      password: hashedPassword,
      employee: employeeId, // Link the user to the employee
    });

    await newUser.save();

    // Update the employee's wsaccount status
    employee.wsaccount = true;
    await employee.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


// POST route for login
router.post('/login', async (req, res) => {
  const { loginValue, password } = req.body; // loginValue can be either email or username

  try {
    // Check if loginValue is email or username
    let user;
    if (loginValue.includes('@')) {
      // It's an email
      user = await User.findOne({ email: loginValue });
    } else {
      // It's a username
      user = await User.findOne({ username: loginValue });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Compare the password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password); // Compare with hashed password
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, // Payload (user info)
      'your_secret_key',    // Secret key for encoding
      { expiresIn: '1h' }   // Set token expiry
    );

    // Send the response with the token and user details
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        phoneNumber:user.phoneNumber,
        password:user.password,
        employee:user.employee
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('employee');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber, // Include phoneNumber
      employee: user.employee,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to update profile, including password
router.put('/update-profile', async (req, res) => {
  const { userId, username, email, phoneNumber, currentPassword, newPassword } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If currentPassword is provided, validate it
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      // If newPassword is provided, hash it
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
      }
    }

    // Update other profile fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully.', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile.' });
  }
});

  router.get('/user/:id', async(req, res)=>{
    try{
      const employee = await User.findById(req.params.id).populate('employee')
      res.status(200).json(employee)
    } catch(err){
        res.status(500).json({err:'no data found'})
    }
    
  })

module.exports = router;

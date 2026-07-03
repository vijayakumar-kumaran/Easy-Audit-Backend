const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const UserSchema = require('../models/User')
// Create new employee
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      designation,
      phoneNumber,
      gender,
      aadhaarNumber,
      address,
    } = req.body;
    // Check for missing fields
    if (
      !name ||
      !email ||
      !department ||
      !designation ||
      !phoneNumber ||
      !gender ||
      !aadhaarNumber ||
      !address
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create new employee
    const newEmployee = new Employee({
      name,
      email,
      department,
      designation,
      phoneNumber,
      gender,
      aadhaarNumber,
      address,
      wsaccount: false,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate value for email or Aadhaar Number' });
    }
    console.error('Error saving employee:', err);
    res.status(500).json({ error: err.message });
  }
});

  // Get all employees
  router.get('/all', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200).json(employees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/role', async (req, res) => {
    try {
      // Find all users with the role "employee"
      const users = await UserSchema.find({ role: "employee" }).populate('employee');
      
      // Get the employee details by mapping the populated user data
      const employees = users.map(user => user.employee);
  
      res.status(200).json(employees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Find all Admins
  router.get('/role/admin', async (req, res) => {
    try {
      // Find all users with the role "employee"
      const users = await UserSchema.find({ role: "admin" }).populate('employee');
      
      // Get the employee details by mapping the populated user data
      const employees = users.map(user => user.employee);
  
      res.status(200).json(employees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get UserID using employee id
  router.get('/userid/:id', async(req, res)=>{
    const empid = req.params.id;
    try{      
      const userid = await UserSchema.findOne({employee:empid})
      console.log(userid)
      res.status(200).json(userid)
    } catch(err){
      res.status(500).json({err: "User id not found"})
    }
  })

  // Get employee by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Find the employee by ID
      const employee = await Employee.findById(id);

      // If no employee found, return 404
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.status(200).json(employee);
    } catch (err) {
      // Handle potential errors (e.g., invalid ID format)
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid employee ID' });
      }
      res.status(500).json({ error: err.message });
    }
  });


// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      designation,
      phoneNumber,
      gender,
      aadhaarNumber,
      address,
      status,
    } = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name,
        email,
        department,
        designation,
        phoneNumber,
        gender,
        aadhaarNumber,
        address,
        status,
      },
      { new: true }
    );

    res.status(200).json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search employees
router.get('/search', async (req, res) => {
  try {
    const { name, department, designation, phoneNumber } = req.query;
    const filters = {};

    if (name) filters.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    if (department) filters.department = department;
    if (designation) filters.designation = designation;
    if (phoneNumber) filters.phoneNumber = phoneNumber;

    const employees = await Employee.find(filters);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update wsaccount to true after signup
router.put('/:id/wsaccount', async (req, res) => {
  try {
    const { id } = req.params;

    // Update wsaccount to true
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { wsaccount: true },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

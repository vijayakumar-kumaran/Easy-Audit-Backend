// routes/leaveRoutes.js
const express = require('express');
const mongoose = require('mongoose')
const Leave = require('../models/Leave');
const router = express.Router();
const NotificationSchema  = require('../models/Notfications');

  // Request leave (Employee)
  router.post('/request', async (req, res) => {
    try {
      const { employeeId, name, leaveType, startDate, endDate, description, assignedAdmin, from, to } = req.body;
      const newLeave = new Leave({ 
        employeeId,
        name,
        leaveType,
        description,
        startDate, 
        endDate,
        assignedAdmin
      });

      await newLeave.save();
      res.status(201).json(newLeave);

      // Notification
      const notification = new NotificationSchema({
        sender: from,
        recipient:to,
        title: "Leave Request",
        message:"I need a leave"
      })
      await notification.save();
      res.status(200).json(notification)
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  });

  // Get all leave requests (Admin)
  router.get('/all', async (req, res) => {
    try {
      const leaveRequests = await Leave.find().populate()
     
      res.json(leaveRequests);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  });

  // Update leave status (Admin)
  router.put('/update/:id', async (req, res) => {
    try {
      const { from, to, status } = req.body;
      
      // Update the leave status
      const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
  
      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
  
      // Create and save the notification
      const notification = new NotificationSchema({
        sender: from,
        recipient: to,
        title: `Leave Update`,
        message: `Your Leave request is ${status}`,
      });
  
      await notification.save();
  
      // Send a single response once everything is successful
      res.json({ leave, notification });
  
    } catch (error) {
      console.error('Error updating leave status:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });
  

  router.get('/history/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { filter } = req.query;
  
      // Ensure employeeId is an ObjectId
      const objectId = new mongoose.Types.ObjectId(employeeId);
  
      // Compute the date range
      let startDate;
      if (filter === 'week') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (filter === 'month') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (filter === 'year') {
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
      } else {
        startDate = new Date(0);
      }
  
      console.log('Employee ID:', employeeId);
      console.log('Filter:', filter);
      console.log('Computed Start Date:', startDate);
  
      // Query leave history
      const leaveHistory = await Leave.find({
        employeeId: objectId,
        $or: [
          { startDate: { $gte: startDate } },
          { endDate: { $gte: startDate } }
        ]
      }).populate('employeeId', 'name email');
  
      res.json(leaveHistory);
    } catch (error) {
      console.error('Error fetching leave history:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });
  

  // Get leave request by ID
  router.get('/:id', async (req, res) => {
    try {
      const leave = await Leave.findById(req.params.id).populate('employeeId', 'name email');
      
      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      res.json(leave);
    } catch (error) {
      console.error('Error fetching leave request by ID:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });
    
  // Get leave requests for a specific employee
  router.get('/employee/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const leaveRequests = await Leave.find({ employeeId });
      res.json(leaveRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

module.exports = router;


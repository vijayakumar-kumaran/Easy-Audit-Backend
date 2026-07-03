const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const taskSchema = require('../models/task');
const notificationSchema= require('../models/Notfications');

  // Create a new task
  router.post('/', async (req, res) => {
    try {
      const { title, description, assignedTo, assignedToNotification, assignedFrom, status, dueDate } = req.body;
      console.log("Task Data:", { title, description, assignedTo, assignedFrom, status, dueDate });

      const newTask = new taskSchema({
        title,
        description,
        assignedTo,
        assignedFrom,
        status,
        dueDate,
      });

      await newTask.save();

      // Create a notification for the assigned employee
      const notification = new notificationSchema({
        sender:assignedFrom,
        recipient: assignedToNotification,
        title: 'New Task Assigned',
        message: `${title}`,
      });

      await notification.save();

      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Error creating task' });
    }
  });

  // Get all tasks or tasks created today
  router.get('/all', async (req, res) => {
    try {
      const alltasks = await taskSchema.find()
      res.status(200).json(alltasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  });

  // Get all tasks created today
  router.get('/today', async (req, res) => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1); // Next day at UTC midnight

      console.log('Fetching tasks from:', today.toISOString(), 'to', tomorrow.toISOString()); // Debugging log

      const tasks = await taskSchema.find({
        createdAt: { $gte: today, $lt: tomorrow },
      });
      console.log(tasks)

      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  });


// Edit a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;
  try {
    const task = await Task.findByIdAndUpdate(id, updatedTask, { new: true });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
});

// Update a task with additional fields
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { description, remarks, progress, assignedFrom, assignedTo} = req.body; // Ensure assignedFrom and assignedTo are included
  console.log(req.body);
  try {
    const task = await taskSchema.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task fields
    task.empDescription = description;
    if (remarks) task.remarks = remarks;
    if (progress) task.status = progress;

    // Ensure assignedFrom and assignedTo are provided
    if (!assignedFrom || !assignedTo) {
      return res.status(400).json({ message: 'AssignedFrom and AssignedTo are required' });
    }
    const updatedTask = await task.save();

    // Create a notification for the assigned employee
    const notification = new notificationSchema({
      sender: assignedFrom, // Admin who updated the task
      recipient: assignedTo, // Employee the task is assigned to
      title: 'Task Updated',
      message: `"${task.title}"`,
    });

    // Save the notification
    await notification.save();

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error });
  }
});


// Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
});

module.exports = router;

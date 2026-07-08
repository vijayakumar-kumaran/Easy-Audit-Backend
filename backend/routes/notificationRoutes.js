const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { requireLogin } = require('../middleware/auth');

// Get active notifications for current user
router.get('/notifications', requireLogin, async (req, res) => {
  try {
    const { username, usertype } = req.session.user;
    
    const notifications = await Notification.find({
      $or: [
        { recipient: username },
        { recipient: usertype },
        { recipient: 'all' }
      ]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
});

// Clear/Delete notification
router.delete('/notifications/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Server error deleting notification' });
  }
});

module.exports = router;

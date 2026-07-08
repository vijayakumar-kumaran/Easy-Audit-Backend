const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { requireLogin } = require('../middleware/auth');


// Get Inbox
router.get('/messages/inbox', requireLogin, async (req, res) => {
  try {
    const { username } = req.session.user;
    const inbox = await Message.find({ recipient: username }).sort({ createdAt: -1 });
    res.json(inbox);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ error: 'Server error fetching inbox messages' });
  }
});

// Get Sent Mail
router.get('/messages/sent', requireLogin, async (req, res) => {
  try {
    const { username } = req.session.user;
    const sent = await Message.find({ sender: username }).sort({ createdAt: -1 });
    res.json(sent);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ error: 'Server error fetching sent messages' });
  }
});

// Send Message
router.post('/messages', requireLogin, async (req, res) => {
  try {
    const { username } = req.session.user;
    const { recipient, subject, body } = req.body;

    if (!recipient || !subject || !body) {
      return res.status(400).json({ error: 'Missing recipient, subject, or message body.' });
    }

    // Check if recipient user exists
    const recUser = await User.findOne({ username: recipient });
    if (!recUser) {
      return res.status(404).json({ error: 'Recipient user does not exist.' });
    }

    const message = new Message({
      sender: username,
      recipient,
      subject,
      body
    });
    await message.save();

    // Trigger Notification for recipient
    const notification = new Notification({
      recipient: recipient,
      sender: username,
      title: 'New Internal Message',
      message: `You received an in-app mail from ${username}: "${subject.slice(0, 30)}${subject.length > 30 ? '...' : ''}"`,
      link: '/messages'
    });
    await notification.save();

    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

// Mark message as read
router.put('/messages/:id/read', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Server error updating message' });
  }
});

// List all registered usernames for composition dropdown
router.get('/users-list', requireLogin, async (req, res) => {
  
  try {
    const users = await User.find({}).select('username usertype -_id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ error: 'Server error fetching user list' });
  }
});

module.exports = router;

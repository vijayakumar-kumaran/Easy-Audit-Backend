const Notification = require('../models/Notfications');
const router = require('./employee_routes');
const User = require('../models/User');

  router.get('/task/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Find the employee ID associated with the user
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: 'User not found for the given user.' });
      }
  
      // Fetch notifications for the employee
      const notifications = await Notification.find({ recipient: user, read:false }).sort({ createdAt: -1 });
      res.status(200).json({ notifications });
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
  });

  // Mark as read
  router.put('/markAsRead/:notificationId', async (req, res) => {
    const { notificationId } = req.params;
  
    try {
      const notification = await Notification.findById(notificationId);
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      // Update the 'read' status to true
      notification.read = true;
  
      await notification.save();
  
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Delete Notifications 
  router.put('/clearAll/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Fetch the user's employee ID
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: 'User not found for the given user.' });
      }
    
      // Update all notifications for the employee to set 'read' to true
      const result = await Notification.updateMany(
        { recipient: user },
        { $set: { read: true } }
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'All notifications marked as read' });
      } else {
        res.status(404).json({ message: 'No notifications found to update' });
      }
    } catch (error) {
      console.error('Error in clearAll:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router;

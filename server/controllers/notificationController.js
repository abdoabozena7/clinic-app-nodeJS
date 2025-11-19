const { Notification } = require('../models');

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await Notification.findByPk(id);
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update({ read: true }, { where: { userId } });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
import { DB } from '../models/index.js';

export async function getNotifications(req, res) {
  try {
    let notifications = await DB.Notification().find();

    if (req.user.role === 'CUSTOMER') {
      notifications = notifications.filter(n => n.userId === req.user.id || n.userId === req.user._id);
    } else if (req.user.role === 'ADMIN') {
      notifications = notifications.filter(n => n.role === 'ADMIN' || n.userId === 'admin' || n.userId === req.user.id);
    } else if (req.user.role === 'STAFF') {
      notifications = notifications.filter(n => n.role === 'STAFF' || n.userId === req.user.id);
    }

    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notif = await DB.Notification().findById(id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });

    const updated = await DB.Notification().findByIdAndUpdate(id, { read: true });
    res.json({ success: true, notification: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const notifs = await DB.Notification().find();
    for (const n of notifs) {
      if (!n.read) {
        await DB.Notification().findByIdAndUpdate(n._id || n.id, { read: true });
      }
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

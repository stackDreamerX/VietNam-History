const NotificationService = require("../services/NotificationService");

module.exports = {
  // Tạo thông báo mới
  async createNotification(req, res) {
    try {
      const { user_id, message, type, metadata } = req.body;
      if (!user_id || !message || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const notification = await NotificationService.createNotification(
        user_id,
        message,
        type,
        metadata
      );

      return res.status(201).json({
        message: "Notification created successfully",
        notification,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lấy tất cả thông báo của người dùng
  async getNotifications(req, res) {
    try {
      const { user_id } = req.params;

      const notifications = await NotificationService.getNotificationsByUser(user_id);

      if (notifications.length === 0) {
        return res.status(404).json({ message: "No notifications found" });
      }

      return res.status(200).json({ notifications });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Đánh dấu thông báo là đã đọc
  async markAsRead(req, res) {
    try {
      const { notification_id } = req.params;

      const notification = await NotificationService.markAsRead(notification_id);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({
        message: "Notification marked as read",
        notification,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lấy thông báo theo ID
  async getNotificationById(req, res) {
    try {
      const { notification_id } = req.params;

      const notification = await NotificationService.getNotificationById(notification_id);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json({ notification });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Xóa thông báo
  async deleteNotification(req, res) {
    try {
      const { notification_id } = req.params;

      await NotificationService.deleteNotification(notification_id);

      return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

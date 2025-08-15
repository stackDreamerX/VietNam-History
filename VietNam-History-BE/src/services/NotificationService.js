const Notification = require("../models/NotificationModel");

class NotificationService {
  // Tạo một thông báo mới
  static async createNotification(user_id, message, type, metadata) {
    try {
      const notification = new Notification({
        user_id,
        message,
        type,
        metadata,
      });
      await notification.save();
      return notification;
    } catch (err) {
      throw new Error("Error creating notification: " + err.message);
    }
  }

  // Lấy tất cả thông báo của một user
  static async getNotificationsByUser(user_id) {
    try {
      const notifications = await Notification.find({ user_id })
        .populate({
          path: 'metadata.question_id', // Liên kết đến bảng Question để lấy title
          select: 'title' // Chỉ lấy trường title từ bảng Question
        })
        .populate({
          path: 'metadata.answer_id', // Liên kết đến bảng Answer để lấy thông tin câu trả lời
          select: 'userAns', // Lấy thông tin người trả lời
          populate: {
            path: 'userAns', // Liên kết đến bảng User để lấy tên người trả lời
            select: 'name' // Chỉ lấy tên người trả lời
          }
        })
        .populate({
          path: 'metadata.quesVote_id', // Liên kết đến bảng QuestionVote để lấy thông tin người vote
          select: 'user', // Lấy thông tin người đã vote
          populate: {
            path: 'user', // Liên kết đến bảng User để lấy tên người đã vote
            select: 'name' // Chỉ lấy tên người đã vote
          }
        })
        .populate({
          path: 'metadata.follow_id', 
          select: 'name',
        })
        .populate({
          path: 'user_id', // Liên kết đến bảng User để lấy tên người nhận thông báo
          select: 'name' // Lấy tên người nhận thông báo
        })
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian giảm dần
  
      return notifications;
    } catch (err) {
      throw new Error("Error fetching notifications: " + err.message);
    }
  }
  

  // Đánh dấu thông báo là đã đọc
  static async markAsRead(notification_id) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notification_id,
        { is_read: true },
        { new: true } // Trả về thông báo đã cập nhật
      );
      return notification;
    } catch (err) {
      throw new Error("Error marking notification as read: " + err.message);
    }
  }

  // Lấy thông báo theo ID
  static async getNotificationById(notification_id) {
    try {
      const notification = await Notification.findById(notification_id);
      return notification;
    } catch (err) {
      throw new Error("Error fetching notification by id: " + err.message);
    }
  }

  // Xóa thông báo
  static async deleteNotification(notification_id) {
    try {
      await Notification.findByIdAndDelete(notification_id);
      return { message: "Notification deleted successfully" };
    } catch (err) {
      throw new Error("Error deleting notification: " + err.message);
    }
  }
}

module.exports = NotificationService;

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");

// Tạo thông báo mới
router.post("/create-notification", notificationController.createNotification);

// Lấy tất cả thông báo của người dùng
router.get("/notifications/:user_id", notificationController.getNotifications);

// Đánh dấu thông báo là đã đọc
router.put("/:notification_id/read", notificationController.markAsRead);

// Lấy thông báo theo ID
router.get("/get-detail/:notification_id", notificationController.getNotificationById);

// Xóa thông báo
router.delete("/delete/:notification_id", notificationController.deleteNotification);

module.exports = router;

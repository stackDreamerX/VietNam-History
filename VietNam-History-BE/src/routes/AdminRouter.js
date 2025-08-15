const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

// Đăng ký admin
router.post("/sign-up", adminController.createAdmin);

// Đăng nhập admin
router.post("/log-in", adminController.loginAdmin);

// Lấy thông tin chi tiết của admin
router.get("/get-detail-admin/:id", authUserMiddleware, adminController.getDetailsAdmin);

// Lấy danh sách tất cả admin (có phân trang)
router.get("/get-all-admin", adminController.getAllAdmin);

// Cập nhật thông tin admin
router.put("/update-admin/:id", authMiddleware, adminController.updateAdmin);

// Xóa tài khoản admin
router.delete("/delete-admin/:id",adminController.deleteAdmin);

// Refresh token
router.post("/refresh-token", adminController.refreshToken);

// Đổi mật khẩu admin
router.put("/change-password/:id", authMiddleware, adminController.changePasswordAdmin);

router.get("/filter", adminController.filterAdmin);

// Kích hoạt/Vô hiệu hóa admin
//router.put("/toggle-admin-status/:id", authMiddleware, adminController.toggleAdminStatus);

module.exports = router;

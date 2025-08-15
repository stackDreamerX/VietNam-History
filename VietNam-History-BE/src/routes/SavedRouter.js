const express = require("express");
const router = express.Router();
const savedController = require("../controllers/SavedController");

// Tạo bản lưu mới
router.post("/create-saved", savedController.createSaved);

// Cập nhật thông tin bản lưu
router.put("/update-saved/:id", savedController.updateSaved);

// Xóa bản lưu
router.delete("/delete-saved/:id", savedController.deleteSaved);

// Lấy chi tiết bản lưu
router.get("/get-detail-saved/:id", savedController.getDetailSaved);

// Lấy tất cả bản lưu của một bài viết
router.get("/get-all-saved", savedController.getAllSaved);

module.exports = router;

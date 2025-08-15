const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/CommentController");


// Tạo bản lưu mới
router.post("/create-comment", CommentController.createComment);

// Cập nhật thông tin bản lưu
router.put("/update-comment/:id", CommentController.updateComment);

// Xóa bản lưu
router.delete("/delete-comment/:id", CommentController.deleteComment);

// Lấy chi tiết bản lưu
router.get("/get-detail-comment/:id", CommentController.getDetailsComment);

// Lấy tất cả bản lưu của một bài viết
router.get("/get-all-comment/:postId", CommentController.getAllComment);

// Xem bình luận của một câu trả lời
router.get("/comments/:answerId", CommentController.getCommentsByAnswer);

// Xem bình luận của một người dùng
router.get("/byUser/:userId", CommentController.getCommentsByUser);


module.exports = router;

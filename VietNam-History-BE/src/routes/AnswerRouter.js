const express = require("express");
const router = express.Router();
const answerController = require("../controllers/AnswerController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Tạo bản lưu mới
router.post("/create-answer", answerController.createAnswer);

// Cập nhật thông tin bản lưu
router.put("/update-answer/:id", answerController.updateAnswer);

// Xóa bản lưu
router.delete("/delete-answer/:id", answerController.deleteAnswer);

// Lấy chi tiết bản lưu
router.get("/get-detail-answer/:id", answerController.getDetailsAnswer);

//Lấy tất cả bản lưu của một bài viết
router.get("/get-all-answer/:postId", answerController.getAllAnswer);

//Xem cau tra loi cua 1 cau hoi 
router.get("/get-by-question/:questionId", answerController.getAnswersByQuestionId);
//Xem cau tra loi cua 1 cau hoi (admin)
router.get("/admin/get-by-question/:questionId", answerController.getAnswersByQuestionIdAdmin);
//Thay doi trang thai cau tra loi
router.put("/toggle-active/:id",  answerController.toggleActiveAns);
//vote
router.post("/:id/vote", answerController.addVote);
router.get("/get-by-statistic", answerController.getStatisticByUser);
router.get("/user/:userId",  answerController.getAnswersByUserId);
module.exports = router;

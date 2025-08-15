const express = require("express");
const QuestionReportController = require("../controllers/QuestionReportController");

const router = express.Router();

router.post(
  "/create-question-report",
  QuestionReportController.createQuestionReport
); // Tạo report
router.get("/get-all-question-report", QuestionReportController.getAllReports); // Lấy danh sách tất cả report
router.get("/get-question-report/:id", QuestionReportController.getReportById); // Lấy thông tin report theo ID
router.delete(
  "delete-question-report/:id",
  QuestionReportController.deleteReport
); // Xóa report theo ID

module.exports = router;

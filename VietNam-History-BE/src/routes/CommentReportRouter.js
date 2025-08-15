const express = require("express");
const CommentReportController = require("../controllers/CommentReportController");

const router = express.Router();

router.post(
  "/create-comment-report",
  CommentReportController.createCommentReport
); // Tạo report

module.exports = router;

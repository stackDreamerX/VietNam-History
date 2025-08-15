const CommentReportService = require("../services/CommentReportService");

const createCommentReport = async (req, res) => {
  try {
    const { user, comment } = req.body;

    if (!user || !comment) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID and Comment ID are required.",
      });
    }

    const response = await CommentReportService.createCommentReport(req.body);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

module.exports = {
  createCommentReport,
};

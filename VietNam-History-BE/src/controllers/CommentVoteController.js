const CommentVoteService = require("../services/CommentVoteService");

// Tạo hoặc cập nhật vote
const createOrUpdateVote = async (req, res) => {
  try {
    const { type, userId, commentId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!type || !userId || !commentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The input fields are required",
      });
    }

    const response = await CommentVoteService.createOrUpdateVote(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

// Xóa vote
const deleteVote = async (req, res) => {
  try {
    const { userId, commentId } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !commentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId and questionId are required",
      });
    }

    const response = await CommentVoteService.deleteVote(userId, commentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

// Lấy danh sách votes theo câu hỏi
const getVotesByComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The commentId is required",
      });
    }

    const response = await CommentVoteService.getVotesByComment(commentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

// Kiểm tra trạng thái vote của người dùng
const checkVoteStatus = async (req, res) => {
  try {
    const { userId, commentId } = req.params;

    if (!userId || !commentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId and commentId are required",
      });
    }

    const response = await CommentVoteService.checkVoteStatus(userId, commentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

// Lấy thống kê lượt vote cho câu hỏi
const getVoteStats = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(200).json({
        status: "ERR",
        message: "The commentId is required",
      });
    }

    const response = await CommentVoteService.getVoteStats(commentId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createOrUpdateVote,
  deleteVote,
  getVotesByComment,
  checkVoteStatus,
  getVoteStats,
};

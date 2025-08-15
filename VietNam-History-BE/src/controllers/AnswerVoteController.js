const AnswerVoteService = require("../services/AnswerVoteService");

// Lấy danh sách votes theo câu hỏi
const getVotesByAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;

    if (!answerId) {
      return res.status(200).json({
        status: "ERR",
        message: "The answerId is required",
      });
    }

    const response = await AnswerVoteService.getVotesByAnswer(answerId);
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
    const { userId, answerId } = req.params;

    if (!userId || !answerId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId and answerId are required",
      });
    }

    const response = await AnswerVoteService.checkVoteStatus(userId, answerId);
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
    const { answerId } = req.params;

    if (!answerId) {
      return res.status(200).json({
        status: "ERR",
        message: "The answerId is required",
      });
    }

    const response = await AnswerVoteService.getVoteStats(answerId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getVotesAndAnswersFromUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The 'userId' is required",
      });
    }

    const response = await AnswerVoteService.getVotesAndAnswersFromUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "An error occurred while fetching answers from user votes.",
    });
  }
};

module.exports = {
  getVotesByAnswer,
  checkVoteStatus,
  getVoteStats,
  getVotesAndAnswersFromUser,
};

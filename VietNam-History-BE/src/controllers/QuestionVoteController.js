const QuestionVoteService = require("../services/QuestionVoteService");

// Lấy tất cả các vote của câu hỏi
const getVote = async (req, res) => {
  try {
    const { userId, questionId } = req.params;

    if (!userId || !questionId) {
      return res.status(200).json({
        status: "ERR",
        message: "The 'questionId' or 'userId' is required",
      });
    }

    const response = await QuestionVoteService.getVote(userId, questionId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "An error occurred while fetching votes.",
    });
  }
};

// Kiểm tra trạng thái vote của người dùng đối với câu hỏi
const checkVoteStatus = async (req, res) => {
  try {
    const { userId, questionId } = req.params;

    if (!userId || !questionId) {
      return res.status(200).json({
        status: "ERR",
        message: "Both 'userId' and 'questionId' are required",
      });
    }

    const response = await QuestionVoteService.checkVoteStatus(userId, questionId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "An error occurred while checking vote status.",
    });
  }
};

// Thống kê lượt vote (upvote và downvote) của câu hỏi
const getVoteStats = async (req, res) => {
  try {
    const questionId = req.params.id;

    if (!questionId) {
      return res.status(200).json({
        status: "ERR",
        message: "The 'questionId' is required",
      });
    }

    const response = await QuestionVoteService.getVoteStats(questionId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "An error occurred while fetching vote stats.",
    });
  }
};

const getVotesAndQuestionsFromUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The 'userId' is required",
      });
    }

    const response = await QuestionVoteService.getVotesAndQuestionsFromUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message || "An error occurred while fetching questions from user votes.",
    });
  }
};

module.exports = {
  getVote,
  checkVoteStatus,
  getVoteStats,
  getVotesAndQuestionsFromUser,
};

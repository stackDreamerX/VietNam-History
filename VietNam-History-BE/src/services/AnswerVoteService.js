const AnswerVote = require("../models/AnswerVoteModel");
const Answer = require("../models/AnswerModel");
// Lấy danh sách vote theo câu hỏi
const getVotesByAnswer = (answerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const votes = await AnswerVote.find({ answer: answerId }).populate(
        "user",
        "name"
      );

      resolve({
        status: "OK",
        message: "Get votes successfully",
        data: votes,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Kiểm tra trạng thái vote của người dùng
const checkVoteStatus = (userId, answerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const vote = await AnswerVote.findOne({
        user: userId,
        answer: answerId,
      });

      if (!vote) {
        resolve({
          status: "OK",
          message: "No vote found",
          data: { hasVoted: false },
        });
      } else {
        resolve({
          status: "OK",
          message: "Vote found",
          data: { hasVoted: true, type: vote.type },
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Thống kê lượt vote
const getVoteStats = (answerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const upVotes = await AnswerVote.countDocuments({
        answer: answerId,
        type: true,
      });
      const downVotes = await AnswerVote.countDocuments({
        answer: answerId,
        type: false,
      });

      resolve({
        status: "OK",
        message: "Get vote stats successfully",
        data: { upVotes, downVotes },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getVotesAndAnswersFromUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra xem userId có tồn tại hay không
      if (!userId) {
        resolve({
          status: "FAIL",
          message: "User ID is required",
        });
        return;
      }

      // Lấy tất cả thông tin vote từ userId
      const userVotes = await AnswerVote.find({ user: userId }); // user là trường chứa ID của người dùng
      const answerIds = userVotes.map((vote) => vote.answer); // Lấy danh sách các answerId từ vote

      // Nếu không có vote nào
      if (answerIds.length === 0) {
        resolve({
          status: "OK",
          message: "No votes found for this user",
          data: [],
        });
        return;
      }

      // Lấy toàn bộ thông tin các câu hỏi dựa trên questionIds
      const answers = await Answer.find({ _id: { $in: answerIds } })
        .populate('userAns', 'name email')
        .populate('question', 'title')

      const result = answers.map((answer) => {
        const vote = userVotes.find(
          (vote) => vote.answer.toString() === answer._id.toString()
        );
        return {
          ...answer._doc,
          voteType: vote ? vote.type : null, // Thêm thông tin loại vote (upvote hoặc downvote)
          voteCreatedAt: vote ? vote.createdAt : null, // Thêm thời gian cập nhật của vote
        };
      });

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Answers retrieved successfully from user votes",
        data: result,
      });
    } catch (e) {
      reject({
        status: "FAIL",
        message: "Error retrieving answers from user votes",
        error: e.message,
      });
    }
  });
};

module.exports = {
  getVotesByAnswer,
  checkVoteStatus,
  getVoteStats,
  getVotesAndAnswersFromUser,
};

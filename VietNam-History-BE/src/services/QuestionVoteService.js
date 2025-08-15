const QuestionVote = require("../models/QuestionVoteModel");
const Question = require("../models/QuestionModel");

// Tạo hoặc cập nhật vote
const createOrUpdateVote = (newVote) => {
  const { type, userId, questionId } = newVote;
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra xem người dùng đã vote chưa
      const existingVote = await QuestionVote.findOne({
        user: userId,
        question: questionId,
      });

      if (existingVote) {
        // Nếu đã vote, cập nhật kiểu vote
        existingVote.type = type;
        await existingVote.save();
        resolve({
          status: "OK",
          message: "Vote updated successfully",
          data: existingVote,
        });
      } else {
        // Nếu chưa vote, tạo mới
        const createdNewVote = await QuestionVote.create({
          type: type,
          user: userId,
          question: questionId,
        });
        resolve({
          status: "OK",
          message: "Vote created successfully",
          data: createdNewVote,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Xóa vote
const deleteVote = (userId, questionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm vote của người dùng cho câu hỏi
      const vote = await QuestionVote.findOneAndDelete({
        user: userId,
        question: questionId,
      });

      if (!vote) {
        resolve({
          status: "OK",
          message: "No vote found to delete",
        });
      } else {
        resolve({
          status: "OK",
          message: "Vote deleted successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy danh sách vote theo câu hỏi
const getVote = (userId, questionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const vote = await QuestionVote.findOne({
        user: userId,
        question: questionId,
      });
      resolve({
        status: "OK",
        message: "Get vote successfully",
        data: vote,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Kiểm tra trạng thái vote của người dùng
const checkVoteStatus = (userId, questionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const vote = await QuestionVote.findOne({
        user: userId,
        question: questionId,
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
const getVoteStats = (questionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const upVotes = await QuestionVote.countDocuments({
        question: questionId,
        type: true,
      });
      const downVotes = await QuestionVote.countDocuments({
        question: questionId,
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

const getVotesAndQuestionsFromUser = (userId) => {
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
      const userVotes = await QuestionVote.find({ user: userId }); // user là trường chứa ID của người dùng
      const questionIds = userVotes.map((vote) => vote.question); // Lấy danh sách các questionId từ vote

      // Nếu không có vote nào
      if (questionIds.length === 0) {
        resolve({
          status: "OK",
          message: "No votes found for this user",
          data: [],
        });
        return;
      }

      // Lấy toàn bộ thông tin các câu hỏi dựa trên questionIds
      const questions = await Question.find({ _id: { $in: questionIds } })
        .populate('userQues', 'name email') // Populate thông tin user của câu hỏi
        .populate('tags', 'name'); // Populate thông tin tag của câu hỏi

      const result = questions.map((question) => {
        const vote = userVotes.find(
          (vote) => vote.question.toString() === question._id.toString()
        );
        return {
          ...question._doc,
          voteType: vote ? vote.type : null, // Thêm thông tin loại vote (upvote hoặc downvote)
          voteCreatedAt: vote ? vote.createdAt : null, // Thêm thời gian cập nhật của vote
        };
      });

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Questions retrieved successfully from user votes",
        data: result,
      });
    } catch (e) {
      reject({
        status: "FAIL",
        message: "Error retrieving questions from user votes",
        error: e.message,
      });
    }
  });
};


module.exports = {
  createOrUpdateVote,
  deleteVote,
  getVote,
  checkVoteStatus,
  getVoteStats,
  getVotesAndQuestionsFromUser,
};

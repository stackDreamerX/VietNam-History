const Answer = require("../models/AnswerModel");
const mongoose = require("mongoose");
const AnswerVote = require('../models/AnswerVoteModel');
const Question = require("../models/QuestionModel");
const User = require("../models/UserModel");
const Comment = require("../models/CommentModel");
//tạo Answer
const createAnswer = (newAnswer) => {
  return new Promise(async (resolve, reject) => {
    const {
      content,
      userAns,
      question,
      images
    } = newAnswer;

    try {
      //check tên sản phẩm
      const checkAnswer = await Answer.findOne({
        content: content,
      });
      //nếu name Answer đã tồn tại
      if (checkAnswer !== null) {
        resolve({
          status: "OK",
          message: "The name of Answer is already",
        });
      }

      const createdAnswer = await Answer.create({
        content,
        userAns,
        question,
        images
      });
      if (createdAnswer) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdAnswer,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//update Answer
const updateAnswer = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check name created
      const checkAnswer = await Answer.findOne({
        _id: id,
      });
      //console.log("checkUser", checkUser);

      //nếu Answer ko tồn tại
      if (checkAnswer === null) {
        resolve({
          status: "OK",
          message: "The Answer is not defined",
        });
      }

      const updatedAnswer = await Answer.findByIdAndUpdate(id, data, {
        new: true,
      });
      //console.log("updatedAnswer", updatedAnswer);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedAnswer,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete Answer
const deleteAnswer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
     
      const checkAnswer = await Answer.findOne({ _id: id });

      if (!checkAnswer) {
        resolve({
          status: "OK",
          message: "The Question is not defined",
        });
        return;
      }

      // const questionOwnerId = checkQuestio.userQues;

      const answer = await Answer.findOne({_id : id });
console.log("W",answer.id)
      const answerOwnerId = answer.userAns;

      const answerOwner = await User.findById(answerOwnerId);

      if (answerOwner) {
        answerOwner.answerCount = Math.max(0, answerOwner.answerCount - 1);
        await answerOwner.save();
      }

      const deletedComments = await Comment.deleteMany({ answer: answer.id});


      await Answer.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "DELETE Answer IS SUCCESS, along with associated answers and comments",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy câu trả lời theo ID người dùng
const getAnswerByUserId = (userId, limit, page) => {
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
      //console.log("USER", userId)
      // Tính tổng số câu trả lời của người dùng
      const totalAnswers = await Answer.countDocuments(
        { userAns: userId });

      // Lấy danh sách Câu trả lời theo userId
      const userAnswers = await Answer.find({ userAns: userId })
      
        .limit(limit)
        .skip(page * limit)
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần

      // Kiểm tra kết quả
      if (userAnswers.length === 0) {
        resolve({
          status: "OK",
          message: "No answer found for this user",
          data: [],
        });

        return;
      }

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Answers retrieved successfully",
        data: userAnswers,
        total: totalAnswers,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalAnswers / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};
// tim ID cau trả lời
const findById = async (id) => {
  try {
    const question = await Answer.findById(id); // Mongoose method to find by ID
    return question;
  } catch (error) {
    throw new Error("Error finding question: " + error.message);
  }
};

//get details Answer
const getDetailsAnswer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const answer = await Answer.findOne({ _id: id });

      //nếu Answer ko tồn tại
      if (answer === null) {
        resolve({
          status: "OK",
          message: "The answer is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: answer,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get all Answer
const getAllAnswer = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalAnswer = await Answer.countDocuments();

      if (filter) {
        const label = filter[0];
        const allAnswerFilter = await Answer.find({
          [label]: { $regex: filter[1] },
        })
          .limit(limit)
          .skip(page * limit); //filter gần đúng
        resolve({
          status: "OK",
          message: "Get all Answer IS SUCCESS",
          data: allAnswerFilter,
          total: totalAnswer,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalAnswer / limit),
        });
      }

      if (sort) {
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        //console.log('objectSort', objectSort)
        const allAnswerSort = await Answer.find()
          .limit(limit)
          .skip(page * limit)
          .sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Answer IS SUCCESS",
          data: allAnswerSort,
          total: totalAnswer,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalAnswer / limit),
        });
      }

      const allAnswer = await Answer.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Answer IS SUCCESS",
        data: allAnswer,
        total: totalAnswer,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalAnswer / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAnswersByQuestionId = (questionId, filterActive) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra và chuyển đổi questionId thành ObjectId
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return resolve({
          status: "ERR",
          message: "Invalid questionId format.",
        });
      }

      // Create the query object
      let query = {
        question: new mongoose.Types.ObjectId(questionId),
        active: true
      };


      const answers = await Answer.find(query);

      if (!answers || answers.length === 0) {
        return resolve({
          status: "OK",
          message: "No answers found for this question.",
          data: [],
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: answers,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAnswersByQuestionIdAdmin = (questionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra và chuyển đổi questionId thành ObjectId
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return resolve({
          status: "ERR",
          message: "Invalid questionId format.",
        });
      }

      const answers = await Answer.find({
        question: new mongoose.Types.ObjectId(questionId),
      });

      if (!answers || answers.length === 0) {
        return resolve({
          status: "OK",
          message: "No answers found for this question.",
          data: [],
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: answers,
      });
    } catch (e) {
      reject(e);
    }
  });
};



const toggleActiveAns = async (answerId) => {
  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      throw new Error('Answer not found');
    }

    answer.active = !answer.active;
    await answer.save();

    return {
      status: 'OK',
      message: 'SUCCESS',
      data: answer,
    };
  } catch (error) {
    throw new Error(error.message || 'An error occurred');
  }
};

const getStatisticByUser = async ({ userAns, year, month }) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const answer = await Answer.find({
      userAns: userAns,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    return {
      status: "OK",
      message: "Questions statistics retrieved successfully.",
      data: answer,
    };
  } catch (err) {
    throw new Error(err.message);
  };
};

const addVote = ({ answerId, userId, isUpVote }) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra câu hỏi có tồn tại không
    Answer.findById(answerId)
      .then(answer => {
        if (!answerId) {
          return resolve({ status: "FAIL", message: "Câu trả lời không tồn tại!" });
        }

        // Kiểm tra người dùng đã vote cho câu trả lời này chưa
        return AnswerVote.findOne({ user: userId, answer: answerId })
          .then(existingVote => {
            if (existingVote) {
              // Kiểm tra loại vote của người dùng
              if (existingVote.type === isUpVote) {
                // Nếu là loại vote giống nhau, xóa vote cũ
                return existingVote.deleteOne()
                  .then(() => {
                    if (isUpVote) {
                      answer.upVoteCount -= 1; // Giảm upvote count
                    } else {
                      answer.downVoteCount -= 1; // Giảm downvote count
                    }
                    return answer.save();
                  })
                  .then(() => {
                    resolve({
                      status: "SUCCESS",
                      message: "Vote đã được hủy!",
                      data: answer,
                    });
                  });
              } else {
                // Nếu loại vote khác, xóa vote cũ và thêm vote mới
                return existingVote.deleteOne()
                  .then(() => {
                    if (isUpVote) {
                      answer.upVoteCount += 1; // Tăng upvote count
                      answer.downVoteCount -= 1; // Giảm downvote count
                    } else {
                      answer.downVoteCount += 1; // Tăng downvote count
                      answer.upVoteCount -= 1; // Giảm upvote count
                    }

                    // Thêm vote mới
                    const newVote = new AnswerVote({
                      type: isUpVote,
                      user: userId,
                      answer: answerId,
                    });

                    return newVote.save();
                  })
                  .then(() => {
                    return answer.save();
                  })
                  .then(() => {
                    resolve({
                      status: "SUCCESS",
                      message: isUpVote ? "Upvote thành công!" : "Downvote thành công!",
                      data: answer,
                    });
                  });
              }
            } else {
              // Nếu chưa vote, tạo vote mới
              const newVote = new AnswerVote({
                type: isUpVote,
                user: userId,
                answer: answerId,
              });

              return newVote.save()
                .then(() => {
                  if (isUpVote) {
                    answer.upVoteCount += 1; // Tăng upvote count
                  } else {
                    answer.downVoteCount += 1; // Tăng downvote count
                  }

                  return answer.save();
                })
                .then(() => {
                  resolve({
                    status: "SUCCESS",
                    message: isUpVote ? "Upvote thành công!" : "Downvote thành công!",
                    data: answer,
                  });
                });
            }
          })
          .catch(error => {
            console.error("Error checking existing vote:", error);
            reject({ status: "FAIL", message: "Lỗi hệ thống khi kiểm tra vote!" });
          });
      })
      .catch(error => {
        console.error("Error finding answer:", error);
        reject({ status: "FAIL", message: "Lỗi hệ thống khi tìm trả lời!" });
      });
  });
};


module.exports = {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  getDetailsAnswer,
  getAllAnswer,
  getAnswersByQuestionId,
  toggleActiveAns,
  getAnswersByQuestionIdAdmin,
  getStatisticByUser,
  addVote,
  findById,
  getAnswerByUserId
};

const Question = require("../models/QuestionModel");
const Answer = require("../models/AnswerModel");
const QuestionVote = require('../models/QuestionVoteModel');
const Comment = require("../models/CommentModel");
const User = require("../models/UserModel");
const mongoose = require('mongoose');
const Tag = require("../models/TagModel");

// Tạo câu hỏi mới
const createQuestion = (newQuestion) => {
  return new Promise(async (resolve, reject) => {
    const { title, content, note, userQues, images, tags } = newQuestion;

    try {
      const createdQuestion = await Question.create({
        title,
        content,
        note,
        userQues,
        images,
        tags,
      });

      if (createdQuestion) {
        return resolve({
          status: "OK",
          message: "Question created successfully",
          data: createdQuestion,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Cập nhật câu hỏi
const updateQuestion = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra xem câu hỏi có tồn tại
      const checkQuestion = await Question.findById(id);
      if (!checkQuestion) {
        resolve({
          status: "ERROR",
          message: "The Question does not exist",
        });
        return;
      }

      // Update the question with the provided data
      const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { ...data },
        { new: true } // Return the updated document
      );

      resolve({
        status: "OK",
        message: "Question updated successfully",
        data: updatedQuestion,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa câu hỏi
// Xóa câu hỏi
const deleteQuestion = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkQuestion = await Question.findOne({ _id: id });

      if (!checkQuestion) {
        resolve({
          status: "OK",
          message: "The Question is not defined",
        });
        return;
      }

      const questionOwnerId = checkQuestion.userQues;

      const answers = await Answer.find({ question: id });

      await Answer.deleteMany({ question: id });

      for (const answer of answers) {
        const answerOwnerId = answer.userAns;

        const answerOwner = await User.findById(answerOwnerId);

        if (answerOwner) {
          answerOwner.answerCount = Math.max(0, answerOwner.answerCount - 1);
          await answerOwner.save();
        }

        await Comment.deleteMany({ question: id });
      }

      const questionOwner = await User.findById(questionOwnerId);
      if (questionOwner) {
        questionOwner.quesCount = Math.max(0, questionOwner.quesCount - 1);
        await questionOwner.save();
      }

      await Question.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "DELETE Question IS SUCCESS, along with associated answers and comments",
      });
    } catch (e) {
      reject(e);
    }
  });
};




// Lấy chi tiết câu hỏi
const getDetailsQuestion = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const question = await Question.findOne({ _id: id })
        .populate('linkedQuizzes', 'title description questions totalAttempts');

      if (question === null) {
        resolve({
          status: "OK",
          message: "The Question is not defined",
        });
        return;
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: question,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy tất cả câu hỏi
const getAllQuestion = (limit, page, sort, filter, tag, active) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};

      // Thêm điều kiện lọc theo tag
      if (tag) {
        query.tags = tag;
      }

      // Thêm điều kiện lọc theo filter
      if (filter) {
        const label = filter[0];
        query[label] = { $regex: filter[1] };
      }

      // Thêm điều kiện lọc theo active
      if (typeof active !== "undefined") {
        query.active = active;
      }

      // Đếm tổng số câu hỏi dựa trên query
      const totalQuestion = await Question.countDocuments(query);

      if (sort) {
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        const allQuestionSort = await Question.find(query)
          .populate('linkedQuizzes', 'title description questions totalAttempts')
          .limit(limit)
          .skip((page - 1) * limit)
          .sort(objectSort);
        resolve({
          status: "OK",
          message: "Get all Question IS SUCCESS",
          data: allQuestionSort,
          total: totalQuestion,
          pageCurrent: Number(page),
          totalPage: Math.ceil(totalQuestion / limit),
        });
        return;
      }

      // Lấy danh sách câu hỏi không cần sort
      const allQuestion = await Question.find(query)
        .populate('linkedQuizzes', 'title description questions totalAttempts')
        .limit(limit)
        .skip((page - 1) * limit);

      resolve({
        status: "OK",
        message: "Get all question success",
        data: allQuestion,
        total: totalQuestion,
        pageCurrent: Number(page),
        totalPage: Math.ceil(totalQuestion / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};


// Lấy câu hỏi theo ID người dùng
const getQuestionsByUserId = (userId, limit, page) => {
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

      // Tính tổng số câu hỏi của người dùng
      const totalQuestions = await Question.countDocuments({
        userQues: userId,
      });

      // Lấy danh sách câu hỏi theo userId
      const userQuestions = await Question.find({ userQues: userId })
        .limit(limit)
        .skip(page * limit)
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần

      // Kiểm tra kết quả
      if (userQuestions.length === 0) {
        resolve({
          status: "OK",
          message: "No questions found for this user",
          data: [],
        });
        return;
      }

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Questions retrieved successfully",
        data: userQuestions,
        total: totalQuestions,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalQuestions / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};
// tim ID cau hoi
const findById = async (id) => {
  try {
    const question = await Question.findById(id); // Mongoose method to find by ID
    return question;
  } catch (error) {
    throw new Error("Error finding question: " + error.message);
  }
};
const findByIdAndUpdate = async (id, updateData) => {
  try {
    // Mongoose method to find by ID and update
    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
      new: true, // This ensures that the updated document is returned
      runValidators: true, // This ensures that the update respects your model's validation rules
    });

    return updatedQuestion;
  } catch (error) {
    throw new Error("Error updating question: " + error.message);
  }
};

const toggleActiveQues = async (quesID) => {
  try {
    const ques = await Question.findById(quesID);
    if (!ques) {
      throw new Error("Question is not exist!");
    }

    ques.active = !ques.active; // Đảo ngược trạng thái active
    await ques.save();

    return {
      status: "OK",
      message: "Successful!",
      ques,
    };
  } catch (error) {
    throw new Error(error.message || "Have some error");
  }
};
const getQuestionsFromUserAnswers = (userId) => {
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

      // Lấy tất cả ID của câu trả lời từ userId
      const userAnswers = await Answer.find({ userAns: userId }); // userAns là trường chứa ID của người dùng
      const questionIds = userAnswers.map((answer) => answer.question); // Lấy danh sách các questionId từ câu trả lời

      // Nếu không có câu trả lời nào
      if (questionIds.length === 0) {
        resolve({
          status: "OK",
          message: "No answers found for this user",
          data: [],
        });
        return;
      }

      // Lấy toàn bộ thông tin các câu hỏi dựa trên questionIds
      const questions = await Question.find({ _id: { $in: questionIds } });

      const result = questions.map((question) => {
        const answer = userAnswers.find(
          (answer) => answer.question.toString() === question._id.toString()
        );
        return {
          ...question._doc,
          updatedAt: answer ? answer.updatedAt : null, // Thêm thời gian cập nhật của câu trả lời
        };
      });

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Questions retrieved successfully from user answers",
        data: result,
      });
    } catch (e) {
      reject({
        status: "FAIL",
        message: "Error retrieving questions from user answers",
        error: e.message,
      });
    }
  });
};

const getQuestionsFromUserComments = (userId) => {
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

      // Lấy tất cả ID của câu trả lời từ userId
      const userComments = await Comment.find({ user: userId, question: { $exists: true, $ne: null } }); // userAns là trường chứa ID của người dùng
      const questionIds = userComments.map((comment) => comment.question); // Lấy danh sách các questionId từ câu trả lời

      // Nếu không có câu trả lời nào
      if (questionIds.length === 0) {
        resolve({
          status: "OK",
          message: "No answers found for this user",
          data: [],
        });
        return;
      }

      // Lấy toàn bộ thông tin các câu hỏi dựa trên questionIds
      const questions = await Question.find({ _id: { $in: questionIds } });

      const result = questions.map((question) => {
        const comment = userComments.find(
          (comment) => comment.question.toString() === question._id.toString()
        );
        return {
          ...question._doc,
          updatedAt: comment ? comment.updatedAt : null, // Thêm thời gian cập nhật của câu trả lời
        };
      });

      // Trả về kết quả
      resolve({
        status: "OK",
        message: "Questions retrieved successfully from user comments",
        data: result,
      });
    } catch (e) {
      reject({
        status: "FAIL",
        message: "Error retrieving questions from user comments",
        error: e.message,
      });
    }
  });
};

const addVote = ({ questionId, userId, isUpVote }) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra câu hỏi có tồn tại không
    Question.findById(questionId)
      .then(question => {
        if (!question) {
          return resolve({ status: "FAIL", message: "Câu hỏi không tồn tại!" });
        }

        // Kiểm tra người dùng đã vote cho câu hỏi này chưa
        return QuestionVote.findOne({ user: userId, question: questionId })
          .then(existingVote => {
            if (existingVote) {
              // Kiểm tra loại vote của người dùng
              if (existingVote.type === isUpVote) {
                // Nếu là loại vote giống nhau, xóa vote cũ
                return existingVote.deleteOne()
                  .then(() => {
                    if (isUpVote) {
                      question.upVoteCount -= 1; // Giảm upvote count
                    } else {
                      question.downVoteCount -= 1; // Giảm downvote count
                    }
                    return question.save();
                  })
                  .then(() => {
                    resolve({
                      status: "SUCCESS",
                      message: "Vote đã được hủy!",
                      data: question,
                    });
                  });
              } else {
                // Nếu loại vote khác, xóa vote cũ và thêm vote mới
                return existingVote.deleteOne()
                  .then(() => {
                    if (isUpVote) {
                      question.upVoteCount += 1; // Tăng upvote count
                      question.downVoteCount -= 1; // Giảm downvote count
                    } else {
                      question.downVoteCount += 1; // Tăng downvote count
                      question.upVoteCount -= 1; // Giảm upvote count
                    }

                    // Thêm vote mới
                    const newVote = new QuestionVote({
                      type: isUpVote,
                      user: userId,
                      question: questionId,
                    });

                    return newVote.save();
                  })
                  .then(() => {
                    return question.save();
                  })
                  .then(() => {
                    resolve({
                      status: "SUCCESS",
                      message: isUpVote ? "Upvote thành công!" : "Downvote thành công!",
                      data: question,
                    });
                  });
              }
            } else {
              // Nếu chưa vote, tạo vote mới
              const newVote = new QuestionVote({
                type: isUpVote,
                user: userId,
                question: questionId,
              });

              return newVote.save()
                .then(() => {
                  if (isUpVote) {
                    question.upVoteCount += 1; // Tăng upvote count
                  } else {
                    question.downVoteCount += 1; // Tăng downvote count
                  }

                  return question.save();
                })
                .then(() => {
                  resolve({
                    status: "SUCCESS",
                    message: isUpVote ? "Upvote thành công!" : "Downvote thành công!",
                    data: question,
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
        console.error("Error finding question:", error);
        reject({ status: "FAIL", message: "Lỗi hệ thống khi tìm câu hỏi!" });
      });
  });
};

const getStatisticByUser = async ({ userQues, year, month }) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const questions = await Question.find({
      userQues: userQues,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    return {
      status: "OK",
      message: "Questions statistics retrieved successfully.",
      data: questions,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateViewCount = async (id, userId) => {
  try {
    const question = await Question.findById(id);

    if (!question) {
      return null; // Không tìm thấy câu hỏi
    }

    // Check if userId exists in User collection
    const userExists = await User.findById(userId);

    // If user doesn't exist (possibly an admin) or not the creator, update view count
    if (!userExists || (userExists && question.userQues.toString() !== userId.toString())) {
      question.view = (question.view || 0) + 1;
      await question.save();
    }

    return question;
  } catch (error) {
    throw error; // Ném lỗi để controller xử lý
  }
};
const searchQuestion = async (searchParams) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { keyword, tags, limit = 10, page = 1, sort, active } = searchParams;
      const query = {};

      // Tìm kiếm theo từ khóa trong nội dung câu hỏi sử dụng RegExp
      if (keyword) {
        // Tạo biểu thức chính quy cho từ khóa, cho phép tìm kiếm không phân biệt chữ hoa chữ thường và không cần phải khớp chính xác
        const regex = keyword.split(' ').join('.*');
        query.$or = [
          { title: { $regex: regex, $options: 'i' } },  // Tìm kiếm trong title
          { content: { $regex: regex, $options: 'i' } }  // Tìm kiếm trong content
        ];
      }

      // Lọc theo tag
      if (tags && tags.length > 0) {
        const tagObjects = await Tag.find({
          name: {
            $in: tags.map((tag) => new RegExp(tag, "i"))
          },
        });

        if (tagObjects.length > 0) {
          const tagIds = tagObjects.map((tag) => tag._id);
          query.tags = { $in: tagIds };
        }
      }

      // Lọc theo trạng thái
      if (typeof active !== "undefined") {
        query.active = active;
      }

      // Đếm tổng số kết quả
      const totalQuestions = await Question.countDocuments(query);

      // Sắp xếp nếu có từ khóa hoặc sắp xếp theo field nếu có
      const sortOption = keyword
        ? { createdAt: -1 }  // Sắp xếp theo thời gian tạo nếu tìm kiếm theo từ khóa
        : sort && sort.field && sort.order
          ? { [sort.field]: sort.order === "asc" ? 1 : -1 }
          : { createdAt: -1 };

      // Truy vấn dữ liệu với phân trang
      const questions = await Question.find(query)
        .limit(Math.max(1, Math.min(Number(limit), 100))) // Giới hạn tối đa 100
        .skip((Math.max(1, Number(page)) - 1) * limit)
        .sort(sortOption);

      // Phản hồi kết quả
      resolve({
        status: "OK",
        message: "Tìm kiếm thành công",
        data: questions,
        total: totalQuestions,
        pageCurrent: Number(page),
        totalPage: Math.ceil(totalQuestions / limit),
      });
    } catch (error) {
      reject({
        status: "FAIL",
        message: "Lỗi xảy ra khi tìm kiếm câu hỏi",
        error: error.message,
      });
    }
  });
};

const updateReportCount = async (id, count) => {
  try {
    const question = await Question.findById(id);

    if (!question) {
      return null; // Không tìm thấy câu hỏi
    }

    // Nếu userId không phải là của người tạo câu hỏi, tăng view

    question.reportCount = count;
    await question.save();

    return question;
  } catch (error) {
    throw error; // Ném lỗi để controller xử lý
  }
};

module.exports = {
  updateReportCount,
  updateViewCount,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getDetailsQuestion,
  getAllQuestion,
  getQuestionsByUserId,
  findById,
  findByIdAndUpdate,
  toggleActiveQues,
  getQuestionsFromUserAnswers,
  getQuestionsFromUserComments,
  addVote,
  findByIdAndUpdate, toggleActiveQues,
  getStatisticByUser,
  searchQuestion,
};

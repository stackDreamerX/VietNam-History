const Question = require("../models/QuestionModel");
const QuestionVote = require("../models/QuestionVoteModel");
const QuestionService = require("../services/QuestionService");

//create Question
const createQuestion = async (req, res) => {
  try {
    const { title, content, note, userQues, images, tags } = req.body;

    if (!title || !content || !userQues) {
      return res.status(400).json({
        status: "ERR",
        message: "Title, content, and userQues are required",
      });
    }

    const response = await QuestionService.createQuestion({
      title,
      content,
      note,
      userQues,
      images,
      tags,
    });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while creating the question",
      error: e.message,
    });
  }
};

// Update Question
const updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { title, content, note, tags, images, linkedQuizzes } = req.body;

    if (!questionId) {
      return res.status(400).json({
        status: "ERR",
        message: "Question ID is required",
      });
    }

    const response = await QuestionService.updateQuestion(questionId, {
      title,
      content,
      note,
      tags,
      images,
      linkedQuizzes,
    });
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "Question not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error updating question: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while updating the question.",
    });
  }
};

//Update Answer Count
const updateAnswerCount = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Lấy câu hỏi hiện tại từ cơ sở dữ liệu
    const question = await QuestionService.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "ERR",
        message: "Question not found",
      });
    }

    // Tăng answerCount lên 1
    const updatedAnswerCount = question.answerCount + 1;

    // Cập nhật câu hỏi với answerCount mới và các trường dữ liệu khác (nếu cần)
    const updatedQuestion = await QuestionService.findByIdAndUpdate(
      questionId,
      {
        answerCount: updatedAnswerCount, // Cập nhật answerCount
        ...req.body, // Cập nhật các trường khác (title, content, note, tags, images)
      },
      { new: true } // Trả về câu hỏi đã cập nhật
    );

    return res.status(200).json({
      status: "OK",
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (e) {
    console.error("Error updating question: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while updating the question.",
    });
  }
};

// Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Kiểm tra nếu ID câu hỏi không tồn tại
    if (!questionId) {
      return res.status(400).json({
        status: "ERR",
        message: "Question ID is required",
      });
    }

    // Gọi service để xóa câu hỏi cùng các answer và comment liên quan
    const response = await QuestionService.deleteQuestion(questionId);

    if (response.status === "OK") {
      return res.status(200).json({
        status: "OK",
        message: response.message,
      });
    }

    return res.status(404).json({
      status: "ERR",
      message: "Question not found",
    });
  } catch (e) {
    console.error("Error deleting question: ", e);
    return res.status(500).json({
      status: "ERR",
      message:
        "An error occurred while deleting the question and associated data.",
    });
  }
};

// Get Details Question
const getDetailsQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    // console.log("questionId", questionId);

    if (!questionId) {
      return res.status(400).json({
        status: "ERR",
        message: "Question ID is required",
      });
    }

    const response = await QuestionService.getDetailsQuestion(questionId);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "Question not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching question details: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching the question details.",
    });
  }
};

// Get All Questions
const getAllQuestion = async (req, res) => {
  try {
    const { limit , page , sort, filter, tag, active } = req.query;

    const response = await QuestionService.getAllQuestion(
      Number(limit),
      Number(page),
      sort,
      filter,
      tag,
      active
    );

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching questions: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching the questions.",
    });
  }
};

// Get Questions by User ID
const getQuestionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, page } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required",
      });
    }

    const response = await QuestionService.getQuestionsByUserId(
      userId,
      Number(limit) || 10,
      Number(page) || 0
    );

    if (!response || response.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "No questions found for the given user ID",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching questions by user ID: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching the questions by user ID.",
      error: e.message,
    });
  }
};

// Get Questions from User Answers
const getQuestionsFromUserAnswers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required",
      });
    }

    // Gọi dịch vụ để lấy danh sách câu hỏi dựa trên câu trả lời của người dùng
    const response = await QuestionService.getQuestionsFromUserAnswers(userId);

    if (!response || response.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "No questions found for the user's answers",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching questions from user answers: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching questions from user answers.",
      error: e.message,
    });
  }
};

// Get Questions from User Comments
const getQuestionsFromUserComments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required",
      });
    }

    // Gọi dịch vụ để lấy danh sách câu hỏi dựa trên câu trả lời của người dùng
    const response = await QuestionService.getQuestionsFromUserComments(userId);

    if (!response || response.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "No questions found for the user's comments",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching questions from user comments: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching questions from user comments.",
      error: e.message,
    });
  }
};

const toggleActiveQues = async (req, res) => {
  const { id } = req.params; // Lấy id từ tham số route
  try {
    const result = await QuestionService.toggleActiveQues(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getStatisticByUser = async (req, res) => {
  try {
    const { userQues, year, month } = req.query;

    if (!userQues || !year || !month) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing required query parameters: user, year, and month.",
      });
    }

    const result = await QuestionService.getStatisticByUser({
      userQues,
      year,
      month,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const addVote = (req, res) => {
  const { questionId, userId, isUpVote } = req.body;
  // Check if all required fields are provided
  if (!questionId || !userId || typeof isUpVote !== "boolean") {
    return res.status(400).json({
      status: "ERR",
      message: "Question ID, User ID, and vote type are required",
    });
  }
  // Call the addVote service method and handle the promise
  QuestionService.addVote({ questionId, userId, isUpVote })
    .then((result) => {
      if (result.status === "FAIL") {
        // If the result status is "FAIL", send a 400 response
        return res.status(400).json(result);
      }
      // Otherwise, send a 200 response with the result data
      return res.status(200).json(result);
    })
    .catch((error) => {
      console.error("Error adding vote:", error);
      // In case of an error, send a 500 response
      return res.status(500).json({
        status: "ERR",
        message: "An error occurred while adding the vote.",
      });
    });
};

const updateViewCount = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Kiểm tra id và userId có được truyền vào không
    if (!id || !userId) {
      return res.status(400).json({
        message: "Invalid parameters. 'id' and 'userId' are required.",
      });
    }

    const updatedQues = await QuestionService.updateViewCount(id, userId);

    if (updatedQues) {
      return res.status(200).json({
        message: "ViewCount updated successfully",
        data: updatedQues,
      });
    } else {
      return res.status(404).json({
        message: "Question not found",
      });
    }
  } catch (error) {
    console.error("Error updating view count:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    })
  }
};

const updateReportCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;

    // Kiểm tra id và userId có được truyền vào không
    if (!id ) {
      return res.status(400).json({
        message: "Invalid parameters. 'id' and 'userId' are required.",
      });
    }

    const updatedQues = await QuestionService.updateReportCount(id, count);

    if (updatedQues) {
      return res.status(200).json({
        message: "ViewCount updated successfully",
        data: updatedQues,
      });
    } else {
      return res.status(404).json({
        message: "Question not found",
      });
    }
  } catch (error) {
    console.error("Error updating view count:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    })
  }
};

const searchQuestion = async (req, res) => {
  try {
    // Destructure query parameters from the request
    const { keyword, tags, limit = 10, page = 1, sort, active } = req.query;

    // Prepare the search parameters for the service
    const searchParams = {
      keyword,
      tags: tags ? tags.split(",") : [], // Split tags by comma if provided
      limit: Number(limit),
      page: Number(page),
      sort: sort ? JSON.parse(sort) : undefined, // Parse sorting options if provided
      active: active !== undefined ? Boolean(active) : undefined, // Convert active to boolean if it's present
    };

    // Call the service function and wait for the result
    const result = await QuestionService.searchQuestion(searchParams);

    // Respond with the result from the service
    return res.status(200).json(result);
  } catch (error) {
    // Catch any errors that occur in the try block and return a 500 status with the error details
    console.error("Error searching questions:", error);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while searching the questions.",
      error: error.message,
    });
  }
};

module.exports = {
  updateReportCount,
  updateViewCount,
  createQuestion,
  updateQuestion,
  updateAnswerCount,
  deleteQuestion,
  getDetailsQuestion,
  getAllQuestion,
  getQuestionsByUserId,
  toggleActiveQues,
  getStatisticByUser,
  getQuestionsFromUserAnswers,
  getQuestionsFromUserComments,
  getQuestionsByUserId,
  toggleActiveQues,
  addVote,
  searchQuestion,
};

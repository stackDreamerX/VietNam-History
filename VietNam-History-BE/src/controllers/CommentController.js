const CommentService = require("../services/CommentService.js");

const createComment = async (req, res) => {
  try {
    //test input data
    const {
      content,
      user,
      answer,
      question
    } = req.body;
    console.log("req.body", req.body);

    if (
      !content ||
      !user 
    ) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    const response = await CommentService.createComment(req.body);
    // console.log("resPON", response)
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const response = await CommentService.updateComment(
      req.params.id,
      req.body
    );
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const response = await CommentService.deleteComment(req.params.id);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const getDetailsComment = async (req, res) => {
  try {
    const response = await CommentService.getDetailsComment(req.params.id);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const getAllComment = async (req, res) => {
  try {
    const response = await CommentService.getAllComment(req.params.postId);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const getCommentsByAnswer = async (req, res) => {
  try {
    const response = await CommentService.getCommentsByAnswer(
      req.params.answerId
    );
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const getCommentsByQuestion = async (req, res) => {
  try {
    const response = await CommentService.getCommentsByQuestion(
      req.params.questionId
    );
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};

const getCommentsByUser = async (req, res) => {
  try {
    const response = await CommentService.getCommentsByUser(
      req.params.userId
    );
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: err.message,
    });
  }
};


module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getDetailsComment,
  getAllComment,
  getCommentsByAnswer,
  getCommentsByUser,
  getCommentsByQuestion
};

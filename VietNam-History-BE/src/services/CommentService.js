const Comment = require("../models/CommentModel");

const createComment = (newComment) => {
  return new Promise(async (resolve, reject) => {
    const {
      content,
      user,
      answer,
      question
    } = newComment;

  try {
  const createdComment = await Comment.create({
    content,
    user,
    answer,
    question
      });
      if (createdComment) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdComment,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateComment = async (id, data) => {
  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return {
        status: "ERR",
        message: "Comment not found.",
      };
    }

    Object.assign(comment, data);
    await comment.save();
    return {
      status: "OK",
      message: "Comment updated successfully.",
      data: comment,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteComment = async (id) => {
  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return {
        status: "ERR",
        message: "Comment not found.",
      };
    }
    await Comment.findByIdAndDelete(id);
    return {
      status: "OK",
      message: "Comment deleted successfully.",
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getDetailsComment = async (id) => {
  try {
    const comment = await Comment.findById(id).populate("user answer");

    if (!comment) {
      return {
        status: "ERR",
        message: "Comment not found.",
      };
    }

    return {
      status: "OK",
      message: "Comment details retrieved successfully.",
      data: comment,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAllComment = async (postId) => {
  try {
    const comments = await Comment.find({ question: postId,  answer: null })
      .populate("user")
      .sort({ createdAt: -1 });

    return {
      status: "OK",
      message: "All comments retrieved successfully.",
      data: comments,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getCommentsByAnswer = async (answerId) => {
  try {
    const comments = await Comment.find({ question: answerId })
      .populate("user")
      .sort({ createdAt: -1 });

    return {
      status: "OK",
      message: "Comments for the answer retrieved successfully.",
      data: comments,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getCommentsByUser = async (userId) => {
  try {
    const comments = await Comment.find({user : userId, question: { $ne: null }});

    if (!comments) throw new Error("Comment not found.");
    return comments;
  } catch (err) {
    throw new Error(err.message);
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
};

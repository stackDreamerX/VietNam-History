const CommentReport = require("../models/CommentReportModel");
const Comment = require("../models/CommentModel");
const User = require("../models/UserModel");

const createCommentReport = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user, comment } = data;

      // Kiểm tra nếu đã tồn tại report giữa user và comment
      const existingReport = await CommentReport.findOne({ user, comment });
      if (existingReport) {
        return resolve({
          status: "ERR",
          message: "You have already reported this question.",
        });
      }

      // Tạo mới report
      const newReport = await CommentReport.create({ user, comment });

      // console.log("newReport", newReport);

      // Tăng reportCount của Question
      await Comment.findByIdAndUpdate(comment, { $inc: { reportCount: 1 } });

      // Tăng reportCount của User
      await User.findByIdAndUpdate(user, { $inc: { reportCount: 1 } });

      resolve({
        status: "OK",
        message: "Comment reported successfully.",
        data: newReport,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: e.message,
      });
    }
  });
};

module.exports = {
  createCommentReport,
};

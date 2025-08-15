const QuestionReport = require("../models/QuestionReportModel");
const Question = require("../models/QuestionModel");
const User = require("../models/UserModel");

const createQuestionReport = async (data, reportThreshold) => {
  const { user, question } = data;

  // Kiểm tra nếu đã tồn tại report giữa user và question
  const existingReport = await QuestionReport.findOne({ user, question });
  if (existingReport) {
    return {
      status: "ERR",
      message: "You have already reported this question.",
    };
  }

  // Tạo mới report
  const newReport = await QuestionReport.create({ user, question });

  // Tăng reportCount của Question
  const updatedQuestion = await Question.findByIdAndUpdate(
    question,
    { $inc: { reportCount: 1 } },
    { new: true }
  );

  // Nếu reportCount vượt ngưỡng, đặt active = false
  if (updatedQuestion.reportCount > reportThreshold) {
    await Question.findByIdAndUpdate(question, { active: false });
  }

  // Tăng reportCount của User
  await User.findByIdAndUpdate(user, { $inc: { reportCount: 1 } });

  return {
    status: "OK",
    message: "Question reported successfully.",
    data: newReport,
  };
};


const getAllReports = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const reports = await QuestionReport.find()
        .populate("user", "name email")
        .populate("question", "title content");
      resolve({
        status: "OK",
        message: "All reports retrieved successfully.",
        data: reports,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getReportById = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const report = await QuestionReport.findById(id)
        .populate("user", "name email")
        .populate("question", "title content");

      if (!report) {
        return resolve({
          status: "ERR",
          message: "Report not found.",
        });
      }

      resolve({
        status: "OK",
        message: "Report retrieved successfully.",
        data: report,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteReport = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedReport = await QuestionReport.findByIdAndDelete(id);

      if (!deletedReport) {
        return resolve({
          status: "ERR",
          message: "Report not found or deletion failed.",
        });
      }

      resolve({
        status: "OK",
        message: "Report deleted successfully.",
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createQuestionReport,
  getAllReports,
  getReportById,
  deleteReport,
  
};

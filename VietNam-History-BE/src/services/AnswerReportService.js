const AnswerReport = require("../models/AnswerReportModel");
const Answer = require("../models/AnswerModel");
const User = require("../models/UserModel");

const createAnswerReport = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user, answer } = data;

      // Kiểm tra nếu đã tồn tại report giữa user và question
      const existingReport = await AnswerReport.findOne({ user, answer });
      if (existingReport) {
        return resolve({
          status: "ERR",
          message: "You have already reported this answer.",
        });
      }

      // Tạo mới report
      const newReport = await AnswerReport.create({ user, answer });

      // console.log("newReport", newReport);

      // Tăng reportCount của Question
      await Answer.findByIdAndUpdate(answer, { $inc: { reportCount: 1 } });

      // Tăng reportCount của User
      await User.findByIdAndUpdate(user, { $inc: { reportCount: 1 } });

      resolve({
        status: "OK",
        message: "Answer reported successfully.",
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

const getDetailsAnswerReport = async (reportId) => {
  try {
    const report = await AnswerReport.findById(reportId).populate(
      "user answer"
    );
    if (!report) {
      throw new Error("Report not found.");
    }
    return report;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAllAnswerReports = async () => {
  try {
    const reports = await AnswerReport.find().populate("user answer");
    return reports;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteAnswerReport = async (reportId) => {
  try {
    const report = await AnswerReport.findByIdAndDelete(reportId);
    if (!report) {
      throw new Error("Report not found.");
    }

    // Giảm số lượng báo cáo trong Answer
    await Answer.findByIdAndUpdate(report.answer, {
      $inc: { reportCount: -1 },
    });

    return report;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getReportsByAnswer = async (answerId) => {
  try {
    const reports = await AnswerReport.find({ answer: answerId }).populate(
      "user"
    );
    if (!reports.length) {
      throw new Error("No reports found for this answer.");
    }
    return reports;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  createAnswerReport,
  getDetailsAnswerReport,
  getAllAnswerReports,
  deleteAnswerReport,
  getReportsByAnswer,
};

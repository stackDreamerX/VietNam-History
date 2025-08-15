//lưu lượt báo cáo của ans
const mongoose = require("mongoose");

const answerReportSchema = new mongoose.Schema(
  {
    //khoa ngoai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const AnswerReport = mongoose.model("AnswerReport", answerReportSchema);
module.exports = AnswerReport;

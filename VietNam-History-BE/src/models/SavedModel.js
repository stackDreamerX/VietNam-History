//lưu các bài lưu của người dùng
const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      require: true,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    // version: {
    //   type: Number,
    //   default: 1, // Bắt đầu từ phiên bản 1
    // },
    // contentSnapshot: {
    //   type: String, // Lưu nội dung của câu hỏi tại thời điểm lưu
    //   required: false,
    // },
  },
  {
    timestamps: true,
  }
);

const Saved = mongoose.model("Saved", savedSchema);
module.exports = Saved;

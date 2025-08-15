const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết đến User nhận thông báo
      required: true,
    },
    message: {
      type: String,
      required: true, // Nội dung thông báo
    },
    is_read: {
      type: Boolean,
      default: false, // Mặc định là chưa đọc
    },
    type: {
      type: String,
      enum: ["answer", "comment", "vote", "follow"], // Loại thông báo (trả lời, bình luận, vote)
      required: true,
    },
    metadata: {
      question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question", // Liên kết đến câu hỏi liên quan
        required: false,
      },
      answer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer", // Liên kết đến câu trả lời nếu có
        required: false,
      },
      quesVote_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionVote",
        required: false,
      },
      follow_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;

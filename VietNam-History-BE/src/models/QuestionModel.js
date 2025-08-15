const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    note: { type: String },
    upVoteCount: { type: Number, default: 0 },
    downVoteCount: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },

    // khóa ngoại
    userQues: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Trường để lưu nhiều ảnh
    images: {
      type: [String], // Mảng các URL ảnh
      default: []
    },

    // Trường để lưu các tags của câu hỏi
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId, // ID của tag từ bảng Tag
        ref: 'Tag', // Tham chiếu đến model 'Tag'
      }
    ],
    
    // Field to store linked quizzes
    linkedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;

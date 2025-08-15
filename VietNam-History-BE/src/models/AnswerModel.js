//lưu câu trả lời
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        upVoteCount: { type: Number, default: 0 },
        downVoteCount: { type: Number, default: 0 },
        answerCount: { type: Number, default: 0 },
        view: { type: Number, default: 0 },
        reportCount: { type: Number, default: 0 },
        active: { type: Boolean, default: true },

        // Trường để lưu nhiều ảnh
        images: {
            type: [String], // Mảng các URL ảnh
            default: []
        },

        //khóa ngoại
        userAns: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            require: true
        },
    },
    {
        timestamps: true,
    }
);

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
//lưu bình luận của câu trả lời
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: {type: String, required: true},
        upVoteCount: {type: Number, default: 0 }, 
        downVoteCount: {type: Number, default: 0 },
        view: {type: Number, default: 0 }, 
        reportCount: {type: Number, default: 0 },
        active: {type: Boolean},

        //khóa ngoại
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            require: true
        },
        answer: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Answer',
            require: false,
            default: ""
        },
        question: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Question',
            require: true,
            
        },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
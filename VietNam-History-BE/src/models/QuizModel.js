const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        questionText: { type: String, required: true },
        options: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }],
        explanation: { type: String },
        type: {
            type: String,
            enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK'],
            required: true
        },
        points: { type: Number, default: 1 }
    }],
    timeLimit: { type: Number }, // in seconds, optional
    tags: [{ type: String }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: { type: Boolean, default: true },
    linkedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    difficulty: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        default: 'MEDIUM'
    },
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passingScore: { type: Number, default: 60 }, // percentage required to pass
    allowReview: { type: Boolean, default: true }, // whether users can review their answers after submission
    randomizeQuestions: { type: Boolean, default: false }, // whether to randomize question order
    category: { type: String }, // e.g., "Lịch sử kháng chiến", "Triều đại nhà Trần"
}, {
    timestamps: true
});

// Index for searching quizzes
quizSchema.index({ tags: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ 'questions.type': 1 });
quizSchema.index({ isActive: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
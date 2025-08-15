const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        timeSpentOnQuestion: { type: Number }, // time spent on each question in seconds
        points: { type: Number } // points earned for this question
    }],
    score: { type: Number, required: true }, // total score
    percentageScore: { type: Number, required: true }, // score as percentage
    timeSpent: { type: Number }, // total time spent in seconds
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    status: {
        type: String,
        enum: ['COMPLETED', 'TIMED_OUT', 'ABANDONED'],
        default: 'COMPLETED'
    },
    isPassed: { type: Boolean, required: true }, // whether user passed the quiz based on passing score
    reviewedAt: { type: Date }, // when user reviewed their answers
    deviceInfo: { // track device info for analytics
        userAgent: String,
        platform: String,
        device: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
quizAttemptSchema.index({ quiz: 1, score: -1 }); // For leaderboard
quizAttemptSchema.index({ user: 1, quiz: 1 }); // For user's quiz history
quizAttemptSchema.index({ quiz: 1, completedAt: -1 }); // For recent attempts
quizAttemptSchema.index({ user: 1, completedAt: -1 }); // For user's recent attempts

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt; 
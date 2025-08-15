const Quiz = require('../models/QuizModel');
const QuizAttempt = require('../models/QuizAttemptModel');
const Question = require('../models/QuestionModel');
const mongoose = require('mongoose');

const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TRUE_FALSE: 'TRUE_FALSE',
    FILL_IN_BLANK: 'FILL_IN_BLANK'
};

const QuizController = {
    // Create a new quiz
    createQuiz: async (req, res) => {
        try {
            const { title, description, questions, timeLimit, tags, linkedQuestions } = req.body;
            const createdBy = req.user.id;

            // Validate questions format
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Quiz must contain at least one question'
                });
            }

            // Validate each question
            for (const question of questions) {
                if (!question.questionText || !question.type) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Each question must have questionText and type'
                    });
                }

                if (!Object.values(QUESTION_TYPES).includes(question.type)) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Invalid question type'
                    });
                }

                if (!question.options || !Array.isArray(question.options)) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Each question must have options array'
                    });
                }

                // Validate based on question type
                switch (question.type) {
                    case QUESTION_TYPES.MULTIPLE_CHOICE:
                        if (question.options.length < 2) {
                            return res.status(400).json({
                                status: 'ERR',
                                message: 'Multiple choice questions must have at least 2 options'
                            });
                        }
                        if (!question.options.some(opt => opt.isCorrect)) {
                            return res.status(400).json({
                                status: 'ERR',
                                message: 'Multiple choice questions must have at least one correct answer'
                            });
                        }
                        break;

                    case QUESTION_TYPES.TRUE_FALSE:
                        if (question.options.length !== 2) {
                            return res.status(400).json({
                                status: 'ERR',
                                message: 'True/False questions must have exactly 2 options'
                            });
                        }
                        if (question.options.filter(opt => opt.isCorrect).length !== 1) {
                            return res.status(400).json({
                                status: 'ERR',
                                message: 'True/False questions must have exactly one correct answer'
                            });
                        }
                        break;

                    case QUESTION_TYPES.FILL_IN_BLANK:
                        if (question.options.length !== 1) {
                            return res.status(400).json({
                                status: 'ERR',
                                message: 'Fill in the blank questions must have exactly one correct answer'
                            });
                        }
                        break;
                }
            }

            const quiz = await Quiz.create({
                title,
                description,
                questions,
                timeLimit,
                tags,
                linkedQuestions,
                createdBy
            });

            return res.status(200).json({
                status: 'OK',
                message: 'Create quiz success',
                data: quiz
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Get all quizzes with pagination and filters
    getAllQuizzes: async (req, res) => {
        try {
            const { page = 1, limit = 10, tag, search } = req.query;
            const query = { isActive: true };

            if (tag) {
                query.tags = tag;
            }

            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }

            const quizzes = await Quiz.find(query)
                .populate('createdBy', 'name email')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Quiz.countDocuments(query);

            return res.status(200).json({
                status: 'OK',
                message: 'Get all quizzes success',
                data: {
                    quizzes,
                    pagination: {
                        total,
                        totalPages: Math.ceil(total / limit),
                        currentPage: parseInt(page),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Get quiz by ID
    getQuizById: async (req, res) => {
        try {
            const quiz = await Quiz.findById(req.params.id)
                .populate('createdBy', 'name email')
                .populate('linkedQuestions');

            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'Quiz not found'
                });
            }

            return res.status(200).json({
                status: 'OK',
                message: 'Get quiz details success',
                data: quiz
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Submit quiz attempt
    submitQuizAttempt: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { quizId } = req.params;
            const { answers, timeSpent } = req.body;
            const userId = req.user.id;

            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'Quiz not found'
                });
            }

            // Calculate score
            let score = 0;
            const gradedAnswers = answers.map((answer) => {
                const question = quiz.questions[answer.questionIndex];
                let isCorrect = false;

                switch (question.type) {
                    case QUESTION_TYPES.MULTIPLE_CHOICE:
                        isCorrect = question.options[answer.selectedOption]?.isCorrect || false;
                        break;

                    case QUESTION_TYPES.TRUE_FALSE:
                        const selectedAnswer = answer.selectedOption === 0 ? 'true' : 'false';
                        isCorrect = selectedAnswer === question.options.find(opt => opt.isCorrect).text.toLowerCase();
                        break;

                    case QUESTION_TYPES.FILL_IN_BLANK:
                        // Case-insensitive comparison for fill in the blank
                        isCorrect = answer.answer?.toLowerCase() === question.options[0].text.toLowerCase();
                        break;

                    default:
                        isCorrect = false;
                }

                if (isCorrect) score++;
                return { 
                    ...answer, 
                    isCorrect,
                    correctAnswer: question.type === QUESTION_TYPES.FILL_IN_BLANK 
                        ? question.options[0].text 
                        : question.options.findIndex(opt => opt.isCorrect)
                };
            });

            // Convert score to percentage
            const percentageScore = (score / answers.length) * 100;
            
            // Check if passed based on quiz passing score
            const isPassed = percentageScore >= (quiz.passingScore || 60);

            const now = new Date();
            const startedAt = new Date(now.getTime() - (timeSpent * 1000));

            const attempt = await QuizAttempt.create({
                quiz: quizId,
                user: userId,
                answers: gradedAnswers,
                score,
                percentageScore,
                timeSpent,
                startedAt,
                completedAt: now,
                isPassed,
                status: 'COMPLETED'
            });

            // Update quiz statistics
            const currentTotalAttempts = quiz.totalAttempts || 0;
            const currentTotalScore = (quiz.averageScore || 0) * currentTotalAttempts;
            const newTotalAttempts = currentTotalAttempts + 1;
            const newAverageScore = (currentTotalScore + percentageScore) / newTotalAttempts;

            // Update the quiz with new statistics
            await Quiz.findByIdAndUpdate(quizId, {
                totalAttempts: newTotalAttempts,
                averageScore: newAverageScore
            }, { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                status: 'OK',
                message: 'Submit quiz success',
                data: {
                    attempt,
                    score: percentageScore,
                    totalQuestions: answers.length,
                    isPassed
                }
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Get quiz leaderboard
    getLeaderboard: async (req, res) => {
        try {
            const { quizId } = req.params;
            const { limit = 20 } = req.query;

            // Get quiz info to include in response
            const quiz = await Quiz.findById(quizId).select('title description');
            
            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'Quiz not found'
                });
            }

            // Get all attempts for this quiz, sorted by score (desc) and time (asc)
            const leaderboard = await QuizAttempt.find({ quiz: quizId })
                .sort({ score: -1, percentageScore: -1, timeSpent: 1 })
                .limit(parseInt(limit))
                .populate('user', 'name email img avatar')
                .select('score percentageScore timeSpent completedAt user');

            // Add user's best attempt to response when authenticated
            let userBestAttempt = null;
            if (req.user && req.user.id) {
                userBestAttempt = await QuizAttempt.findOne({ 
                    quiz: quizId, 
                    user: req.user.id 
                })
                .sort({ score: -1, timeSpent: 1 })
                .select('score percentageScore timeSpent completedAt');
            }

            return res.status(200).json({
                status: 'OK',
                message: 'Get leaderboard success',
                data: {
                    quiz: {
                        id: quiz._id,
                        title: quiz.title,
                        description: quiz.description
                    },
                    entries: leaderboard,
                    userBestAttempt
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Get random quiz by tag
    getRandomQuiz: async (req, res) => {
        try {
            const { tag } = req.query;
            const query = { isActive: true };
            
            if (tag) {
                query.tags = tag;
            }

            const count = await Quiz.countDocuments(query);
            const random = Math.floor(Math.random() * count);
            
            const quiz = await Quiz.findOne(query)
                .skip(random)
                .populate('createdBy', 'name email');

            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'No quiz found'
                });
            }

            return res.status(200).json({
                status: 'OK',
                message: 'Get random quiz success',
                data: quiz
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Update quiz
    updateQuiz: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const quiz = await Quiz.findById(id);

            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'Quiz not found'
                });
            }

            // Check if user is creator or admin
            if (quiz.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    status: 'ERR',
                    message: 'Not authorized to update this quiz'
                });
            }

            const updatedQuiz = await Quiz.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return res.status(200).json({
                status: 'OK',
                message: 'Update quiz success',
                data: updatedQuiz
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    },

    // Delete quiz
    deleteQuiz: async (req, res) => {
        try {
            const { id } = req.params;
            const quiz = await Quiz.findById(id);

            if (!quiz) {
                return res.status(404).json({
                    status: 'ERR',
                    message: 'Quiz not found'
                });
            }

            // Check if user is creator or admin
            if (quiz.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    status: 'ERR',
                    message: 'Not authorized to delete this quiz'
                });
            }

            await Quiz.findByIdAndDelete(id);
            // Also delete all attempts for this quiz
            await QuizAttempt.deleteMany({ quiz: id });

            return res.status(200).json({
                status: 'OK',
                message: 'Delete quiz success'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERR',
                message: error.message
            });
        }
    }
};

module.exports = QuizController; 
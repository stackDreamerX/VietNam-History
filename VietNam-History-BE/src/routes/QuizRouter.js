const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/QuizController');
const { authMiddleware,verifyToken, authUserMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/get-all', QuizController.getAllQuizzes);
router.get('/random', QuizController.getRandomQuiz);
router.get('/get-details/:id', QuizController.getQuizById);
router.get('/leaderboard/:quizId', verifyToken, QuizController.getLeaderboard);

// Protected routes (require authentication)
router.post('/create',verifyToken,  QuizController.createQuiz);
router.put('/update-quiz/:id', verifyToken, QuizController.updateQuiz);
router.delete('/delete-quiz/:id', verifyToken, QuizController.deleteQuiz);
router.post('/submit/:quizId', verifyToken, QuizController.submitQuizAttempt);

module.exports = router; 
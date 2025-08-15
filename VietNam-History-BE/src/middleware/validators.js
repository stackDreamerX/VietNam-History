const { body, param, query, validationResult } = require('express-validator');

// Existing validators...

exports.validateQuiz = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề không được để trống')
    .isLength({ max: 200 })
    .withMessage('Tiêu đề không được quá 200 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được quá 1000 ký tự'),

  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz phải có ít nhất 1 câu hỏi'),
  
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Nội dung câu hỏi không được để trống'),
  
  body('questions.*.options')
    .isArray({ min: 2, max: 5 })
    .withMessage('Mỗi câu hỏi phải có từ 2-5 đáp án'),
  
  body('questions.*.options.*.text')
    .trim()
    .notEmpty()
    .withMessage('Nội dung đáp án không được để trống'),
  
  body('questions.*.options.*.isCorrect')
    .isBoolean()
    .withMessage('Trạng thái đáp án phải là boolean'),
  
  body('questions.*.type')
    .isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK'])
    .withMessage('Loại câu hỏi không hợp lệ'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 30, max: 7200 })
    .withMessage('Thời gian làm bài phải từ 30 giây đến 2 giờ'),
  
  body('difficulty')
    .optional()
    .isIn(['EASY', 'MEDIUM', 'HARD'])
    .withMessage('Độ khó không hợp lệ'),
  
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Điểm đạt phải từ 0-100'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags phải là một mảng'),
  
  body('tags.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tag không được để trống'),
  
  // Validate that each question has exactly one correct answer
  body('questions').custom((questions) => {
    for (const question of questions) {
      const correctAnswers = question.options.filter(opt => opt.isCorrect).length;
      if (correctAnswers !== 1) {
        throw new Error(`Câu hỏi "${question.questionText}" phải có đúng 1 đáp án đúng`);
      }
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateQuizAttempt = [
  body('answers')
    .isArray()
    .withMessage('Câu trả lời phải là một mảng'),
  
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('Index câu hỏi không hợp lệ'),
  
  body('answers.*.answer')
    .notEmpty()
    .withMessage('Câu trả lời không được để trống'),
  
  body('timeSpent')
    .isInt({ min: 0 })
    .withMessage('Thời gian làm bài không hợp lệ'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 
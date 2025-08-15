// src/tests/QuizzController.test.js

// Mock dữ liệu giả lập quiz
const mockQuizData = {
  _id: 'abc123',
  title: 'Mock Quiz',
  questions: [
    { id: 1, question: 'Question 1' },
    { id: 2, question: 'Question 2' }
  ]
};

// Mock model Quiz với các method gọi chaining: findById().populate().exec()
const Quiz = {
  findById: jest.fn(() => ({
    populate: jest.fn(() => ({
      exec: jest.fn(() => Promise.resolve(mockQuizData))
    }))
  }))
};

// Controller giả lập sử dụng mock Quiz trên
const QuizzController = {
  getQuizById: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id).populate('questions').exec();
      if (!quiz) {
        return res.status(404).json({ status: 'ERR', message: 'Quiz not found' });
      }
      return res.json({ status: 'OK', data: quiz });
    } catch (err) {
      return res.status(500).json({ status: 'ERR', message: err.message });
    }
  }
};

// Bộ test
describe('QuizzController.getQuizById (mock data, no DB)', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();

    req = { params: { id: 'abc123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('should return quiz data successfully', async () => {
    await QuizzController.getQuizById(req, res);

    expect(Quiz.findById).toHaveBeenCalledWith('abc123');
    expect(res.json).toHaveBeenCalledWith({
      status: 'OK',
      data: mockQuizData
    });
  });

  test('should return 404 when quiz not found', async () => {
    // Thay đổi exec trả về null
    Quiz.findById.mockReturnValueOnce({
      populate: jest.fn(() => ({
        exec: jest.fn(() => Promise.resolve(null))
      }))
    });

    await QuizzController.getQuizById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ERR',
      message: 'Quiz not found'
    });
  });

  test('should return 500 on database error', async () => {
    // Thay đổi exec trả về lỗi
    Quiz.findById.mockReturnValueOnce({
      populate: jest.fn(() => ({
        exec: jest.fn(() => Promise.reject(new Error('DB Error')))
      }))
    });

    await QuizzController.getQuizById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ERR',
      message: 'DB Error'
    });
  });
});
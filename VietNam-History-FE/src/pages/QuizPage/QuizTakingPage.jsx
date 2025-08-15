import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Space, Button, message, Modal, Progress, Typography } from 'antd';
import QuizQuestion from '../../components/QuizComponent/QuizQuestion';
import QuizResults from '../../components/QuizComponent/QuizResults';
import { getQuizById, submitQuizAttempt } from '../../services/QuizService';
import { ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './QuizTakingPage.css';

const { Text } = Typography;

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timerRef = useRef(null);

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    if (seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate time percentage for progress bar
  const calculateTimePercentage = (timeLeft, totalTime) => {
    if (!totalTime) return 100;
    return Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  };

  // Function to clear timer
  const clearQuizTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Ensure questions array exists and is valid
  const getQuestions = useCallback(() => {
    if (!quiz) return [];
    
    // Handle direct questions array
    if (Array.isArray(quiz.questions)) {
      console.log('Found questions directly in quiz.questions array');
      return quiz.questions;
    }
    
    // Handle nested questions in data property
    if (quiz.data && Array.isArray(quiz.data.questions)) {
      console.log('Found questions in quiz.data.questions array');
      return quiz.data.questions;
    }
    
    // Handle deeply nested data structure (data.data.questions)
    if (quiz.data && quiz.data.data && Array.isArray(quiz.data.data.questions)) {
      console.log('Found questions in quiz.data.data.questions array');
      return quiz.data.data.questions;
    }
    
    // Check for questions property with different casing
    if (Array.isArray(quiz.Questions)) {
      console.log('Found questions in quiz.Questions array (different casing)');
      return quiz.Questions;
    }
    
    // Check for items or content property that might contain questions
    if (Array.isArray(quiz.items)) {
      console.log('Found questions in quiz.items array');
      return quiz.items;
    }
    
    if (Array.isArray(quiz.content)) {
      console.log('Found questions in quiz.content array');
      return quiz.content;
    }
    
    // Handle questions as direct properties of quiz object
    if (typeof quiz === 'object' && quiz !== null) {
      // Check if quiz itself might be an array of questions
      if (Array.isArray(quiz) && quiz.length > 0 && quiz[0].type) {
        console.log('Quiz itself appears to be an array of questions');
        return quiz;
      }
      
      // Look for a property that might contain questions
      for (const key in quiz) {
        if (Array.isArray(quiz[key]) && 
            quiz[key].length > 0 && 
            (quiz[key][0].type || quiz[key][0].question || quiz[key][0].content || quiz[key][0].text)) {
          console.log(`Found questions array in quiz.${key}`);
          return quiz[key];
        }
      }
    }
    
    console.warn('No valid questions array found in quiz data');
    return [];
  }, [quiz]);

  // Submit quiz function (extracted to be reusable)
  const submitQuiz = useCallback(async (isTimeout = false) => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    
    // Clear timer to prevent multiple submissions
    clearQuizTimer();
    
    // If timeout, show message only if we haven't already
    if (isTimeout && !hasTimedOut) {
      setHasTimedOut(true);
      message.warning('Hết thời gian làm bài! Bài làm đã được nộp tự động.');
    }
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const questions = getQuestions();
      
      // Auto-answer unanswered questions if timed out
      let formattedAnswers;
      if (isTimeout) {
        formattedAnswers = questions.map((question, index) => {
          const userAnswer = currentAnswers[index];
          
          if (!userAnswer) {
            // Default answer for unanswered questions when timeout
            if (question.type === 'FILL_IN_BLANK') {
              return {
                questionIndex: index,
                selectedOption: 0,
                answer: ''
              };
            } else {
              return {
                questionIndex: index,
                selectedOption: 0,
                answer: null
              };
            }
          }
          
          // Format answered questions normally
          if (question.type === 'FILL_IN_BLANK') {
            return {
              questionIndex: index,
              selectedOption: 0,
              answer: userAnswer.answer || ''
            };
          } else {
            return {
              questionIndex: index,
              selectedOption: Number(userAnswer.selectedOption),
              answer: null
            };
          }
        });
      } else {
        // Normal submission with validation
        formattedAnswers = questions.map((question, index) => {
          const userAnswer = currentAnswers[index];
          
          if (!userAnswer) {
            throw new Error(`Thiếu câu trả lời cho câu hỏi ${index + 1}`);
          }
          
          if (question.type === 'FILL_IN_BLANK') {
            return {
              questionIndex: index,
              selectedOption: 0,
              answer: userAnswer.answer || ''
            };
          } else if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
            return {
              questionIndex: index,
              selectedOption: Number(userAnswer.selectedOption),
              answer: null
            };
          } else {
            return {
              questionIndex: index,
              selectedOption: 0,
              answer: null
            };
          }
        });
      }

      // Check access token
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Bạn chưa đăng nhập. Vui lòng đăng nhập để nộp bài.');
        navigate('/login');
        return;
      }

      const response = await submitQuizAttempt(quizId, {
        answers: formattedAnswers,
        timeSpent: timeTaken
      });
      
      // Process response data
      if (response && response.data && response.data.attempt) {
        const attemptData = response.data.attempt;
        
        setQuizAttempt({
          score: response.data.score,
          percentageScore: response.data.score,
          timeSpent: attemptData.timeSpent,
          answers: attemptData.answers,
          isPassed: response.data.isPassed,
          status: attemptData.status,
          totalQuestions: response.data.totalQuestions
        });
      } else if (response && response.data) {
        setQuizAttempt(response.data);
      } else {
        setQuizAttempt(response);
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      if (error?.response?.status === 401 || error?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để nộp bài.');
        navigate('/login');
      } else if (error?.response?.data?.message) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, currentAnswers, startTime, quizId, navigate, isSubmitting, hasTimedOut, getQuestions]);

  // Timer effect for countdown
  useEffect(() => {
    if (!quiz || !quiz.timeLimit || hasTimedOut) return;
    
    // Initialize time left when quiz loads
    if (timeLeft === null) {
      setTimeLeft(quiz.timeLimit); // timeLimit is in seconds
    }
    
    // Timer interval
    clearQuizTimer(); // Clear any existing timer
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearQuizTimer();
          submitQuiz(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clear timer on unmount or when quiz changes
    return () => clearQuizTimer();
  }, [quiz, timeLeft, submitQuiz, hasTimedOut]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Add a loading message
        console.log(`Starting to fetch quiz with ID: ${quizId}`);
        
        const response = await getQuizById(quizId);
        console.log('Received API response:', response);
        
        // Log the entire response structure
        console.log('Response structure:', JSON.stringify(response, null, 2));
        
        // Handle different possible response structures
        let quizData;
        
        if (response && response.data) {
          // Response has a nested data property
          quizData = response.data;
          console.log('Quiz data extracted from response.data:', quizData);
        } else {
          // Response is the quiz data directly
          quizData = response;
          console.log('Using direct response as quiz data:', quizData);
        }
        
        // Ensure questions array exists and has proper structure
        if (quizData) {
          // Check if the data is nested one level deeper
          if (quizData.data && typeof quizData.data === 'object') {
            console.log('Found nested data property:', quizData.data);
            
            // If the quiz is in a nested 'quiz' property
            if (quizData.data.quiz && typeof quizData.data.quiz === 'object') {
              quizData = quizData.data.quiz;
              console.log('Using quiz from data.quiz:', quizData);
            } 
            // If main quiz data is in data property 
            else if (!quizData.questions) {
              quizData = { ...quizData, ...quizData.data };
              console.log('Merged data with parent object:', quizData);
            }
          }
          
          // Some APIs nest the questions inside a 'questions' property
          if (!quizData.questions && quizData.data && Array.isArray(quizData.data.questions)) {
            quizData.questions = quizData.data.questions;
            console.log('Extracted questions from quizData.data.questions:', quizData.questions);
          }
          
          // If questions still don't exist, create an empty array
          if (!quizData.questions) {
            console.warn('No questions found in quiz data, initializing empty array');
            quizData.questions = [];
          }
          
          console.log('Final questions array:', quizData.questions);
          console.log('Final quiz data structure:', JSON.stringify(quizData, null, 2));
        } else {
          console.error('No valid quiz data found in the response');
          throw new Error('Invalid quiz data received');
        }
        
        setQuiz(quizData);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        if (error?.status === 401) {
          message.error('Vui lòng đăng nhập để làm bài kiểm tra.');
          navigate('/login');
        } else {
          message.error('Không thể tải bài kiểm tra. Vui lòng thử lại sau.');
          navigate('/quizzes');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    
    // Clear timer when component unmounts
    return () => clearQuizTimer();
  }, [quizId, navigate]);

  const handleAnswerChange = (questionIndex, answer, type) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        questionIndex,
        selectedOption: type === 'FILL_IN_BLANK' ? null : Number(answer),
        answer: type === 'FILL_IN_BLANK' ? answer : null,
        type
      }
    }));
  };

  const handleSubmit = async () => {
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn nộp bài không?',
      okText: 'Nộp bài',
      cancelText: 'Hủy',
      onOk: () => submitQuiz(false)
    });
  };

  const handleRetry = () => {
    setCurrentAnswers({});
    setShowResults(false);
    setQuizAttempt(null);
    setHasTimedOut(false);
    // Reset timer if quiz has time limit
    if (quiz && quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit);
    }
  };

  const handleViewLeaderboard = () => {
    navigate(`/quizzes/${quizId}/leaderboard`);
  };

  if (loading) {
    return (
      <Card>
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <p>Đang tải bài kiểm tra...</p>
        </Space>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <p>Không tìm thấy bài kiểm tra</p>
          <Button onClick={() => navigate('/quizzes')}>Quay lại</Button>
        </Space>
      </Card>
    );
  }

  if (showResults && quizAttempt) {
    return (
      <QuizResults
        quiz={quiz}
        quizAttempt={quizAttempt}
        onRetry={handleRetry}
        onViewLeaderboard={handleViewLeaderboard}
      />
    );
  }

  const questions = getQuestions();
  const allQuestionsAnswered = questions.length > 0 
    ? questions.every((_, index) => currentAnswers[index])
    : false;

  // Determine color for timer based on remaining time
  const getTimerColor = () => {
    if (!quiz.timeLimit) return '';
    
    const percentage = (timeLeft / quiz.timeLimit) * 100;
    if (percentage <= 25) return 'time-danger';
    if (percentage <= 50) return 'time-warning';
    return '';
  };

  return (
    <div className="quiz-taking-container">
      <Card className="quiz-taking-card">
        <div className="quiz-header">
          <Typography.Title level={2} className="quiz-title">{quiz.title}</Typography.Title>
          <Typography.Text className="quiz-description">{quiz.description}</Typography.Text>
        </div>
        
        {quiz.timeLimit && !hasTimedOut && (
          <div className="quiz-info-container">
            <div className="quiz-info-item">
              <ClockCircleOutlined className={`quiz-info-icon ${getTimerColor()}`} />
              <Text className={getTimerColor()}>
                Thời gian còn lại: {formatTime(timeLeft)}
              </Text>
            </div>
            <Progress 
              percent={calculateTimePercentage(timeLeft, quiz.timeLimit)} 
              showInfo={false}
              status={timeLeft <= quiz.timeLimit * 0.25 ? "exception" : "active"}
              strokeColor={
                timeLeft <= quiz.timeLimit * 0.25 ? "#ff4d4f" : 
                timeLeft <= quiz.timeLimit * 0.5 ? "#faad14" : "#1890ff"
              }
              className="time-progress"
            />
          </div>
        )}
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {questions.length > 0 ? (
            <>
              {questions.map((question, index) => (
                <QuizQuestion
                  key={index}
                  question={question}
                  questionNumber={index + 1}
                  currentAnswer={currentAnswers[index]?.selectedOption ?? currentAnswers[index]?.answer}
                  onAnswerChange={(answer) => handleAnswerChange(index, answer, question.type)}
                  showResults={showResults}
                  isSubmitting={isSubmitting}
                />
              ))}
              
              <div className="question-progress">
                <Progress 
                  percent={(Object.keys(currentAnswers).length / questions.length) * 100} 
                  format={() => `${Object.keys(currentAnswers).length}/${questions.length}`}
                />
              </div>
              
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting}
                loading={isSubmitting}
                className="submit-btn"
              >
                Nộp bài
              </Button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Bài kiểm tra này không có câu hỏi nào.</p>
              <Button onClick={() => navigate('/quizzes')}>Quay lại danh sách bài kiểm tra</Button>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default QuizTakingPage; 
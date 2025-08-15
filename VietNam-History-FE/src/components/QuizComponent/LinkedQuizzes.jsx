import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LinkedQuizzes.css';

const LinkedQuizzes = ({ quizzes }) => {
  const navigate = useNavigate();

  if (!quizzes || quizzes.length === 0) {
    return null; // Don't render anything if there are no linked quizzes
  }

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`); // Navigate to the quiz detail page
  };

  const handleViewAllClick = () => {
    navigate('/quizzes'); // Navigate to the quizzes listing page
  };

  return (
    <div className="linked-quizzes-container">
      <div className="linked-quizzes-header">
        <h5>Related Quizzes</h5>
        <button 
          className="view-all-btn" 
          onClick={handleViewAllClick}
        >
          View All
        </button>
      </div>

      <div className="quizzes-list">
        {quizzes.map((quiz) => {
          // Ensure we have numeric values with proper defaults
          const questionsCount = quiz.questions && Array.isArray(quiz.questions) ? quiz.questions.length : 0;
          const attemptsCount = typeof quiz.totalAttempts === 'number' ? quiz.totalAttempts : 0;
          
          return (
            <div 
              key={quiz._id} 
              className="quiz-card" 
              onClick={() => handleQuizClick(quiz._id)}
            >
              <div className="quiz-info">
                <h6 className="quiz-title">{quiz.title}</h6>
                <p className="quiz-description">
                  {quiz.description && quiz.description.length > 100
                    ? `${quiz.description.substring(0, 100)}...`
                    : quiz.description || 'No description available'}
                </p>
              </div>
              <div className="quiz-stats">
                <span className="quiz-stats-item">
                  <i className="bi bi-question-circle"></i> {questionsCount} questions
                </span>
                <span className="quiz-stats-item">
                  <i className="bi bi-people"></i> {attemptsCount} attempts
                </span>
              </div>
              <button className="take-quiz-btn">
                Take Quiz <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkedQuizzes; 
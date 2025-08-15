import React from 'react';
import { Card, Radio, Space, Input, Typography, Alert } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const QuestionCard = styled(Card)`
  margin-bottom: 20px;
  .question-content {
    margin-bottom: 16px;
  }
  .answer-explanation {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  .correct-answer {
    color: #52c41a;
    font-weight: bold;
  }
  .incorrect-answer {
    color: #ff4d4f;
    font-weight: bold;
  }
  .question-points {
    float: right;
    color: #1890ff;
  }
`;

const QuizQuestion = ({
  question,
  questionNumber,
  currentAnswer,
  onAnswerChange,
  showResults,
  isSubmitting,
  userAnswer,
}) => {
  const isAnswerCorrect = showResults && question.correctAnswer === userAnswer;
  const hasAnswered = currentAnswer !== undefined && currentAnswer !== '';

  const renderFeedback = () => {
    if (!showResults) return null;

    const status = isAnswerCorrect ? 'success' : 'error';
    const message = isAnswerCorrect ? 'Câu trả lời chính xác!' : 'Câu trả lời chưa chính xác';
    
    return (
      <Alert
        style={{ marginTop: 16 }}
        message={message}
        type={status}
        showIcon
      />
    );
  };

  const renderCorrectAnswer = () => {
    if (!showResults) return null;

    let correctAnswerText = '';
    if (question.type === 'MULTIPLE_CHOICE') {
      correctAnswerText = question.options[question.correctAnswer]?.text;
    } else if (question.type === 'TRUE_FALSE') {
      correctAnswerText = question.correctAnswer === 0 ? 'True' : 'False';
    } else {
      correctAnswerText = question.correctAnswer;
    }

    return (
      <div style={{ marginTop: 8 }}>
        <Text type="secondary">Đáp án đúng: </Text>
        <Text className="correct-answer">{correctAnswerText}</Text>
      </div>
    );
  };

  const renderOptions = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <Radio.Group
            onChange={(e) => onAnswerChange(e.target.value)}
            value={currentAnswer}
            disabled={isSubmitting || showResults}
          >
            <Space direction="vertical">
              {question.options.map((option, index) => (
                <Radio key={index} value={index}>
                  {option.text}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );
      case 'TRUE_FALSE':
        return (
          <Radio.Group
            onChange={(e) => onAnswerChange(e.target.value)}
            value={currentAnswer}
            disabled={isSubmitting || showResults}
          >
            <Space direction="vertical">
              <Radio value={0}>True</Radio>
              <Radio value={1}>False</Radio>
            </Space>
          </Radio.Group>
        );
      case 'FILL_IN_BLANK':
        return (
          <Input
            placeholder="Nhập câu trả lời của bạn"
            value={currentAnswer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            style={{ maxWidth: 400 }}
            disabled={isSubmitting || showResults}
            maxLength={200}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QuestionCard>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ display: 'inline' }}>
            Câu hỏi {questionNumber}
          </Title>
          <span className="question-points">
            {question.points || 1} điểm
          </span>
        </div>

        <Text strong style={{ fontSize: 16 }}>
          {question.questionText}
        </Text>

        <div style={{ marginTop: 24 }}>
          {renderOptions()}
        </div>

        {!hasAnswered && !showResults && (
          <Text type="warning" style={{ marginTop: 8 }}>
            Vui lòng chọn câu trả lời
          </Text>
        )}

        {renderFeedback()}
        {renderCorrectAnswer()}

        {showResults && question.explanation && (
          <div className="answer-explanation">
            <Text type="secondary">Giải thích: {question.explanation}</Text>
          </div>
        )}
      </Space>
    </QuestionCard>
  );
};

QuizQuestion.propTypes = {
  question: PropTypes.shape({
    questionText: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK']).isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string.isRequired,
    })),
    correctAnswer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    explanation: PropTypes.string,
    points: PropTypes.number,
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  currentAnswer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onAnswerChange: PropTypes.func.isRequired,
  showResults: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  userAnswer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

QuizQuestion.defaultProps = {
  showResults: false,
  isSubmitting: false,
};

export default QuizQuestion; 
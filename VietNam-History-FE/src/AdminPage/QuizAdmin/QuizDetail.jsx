import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, List, Divider, Tag, Button, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getQuizById } from "../../services/QuizService";
import * as TagService from "../../services/TagService";
import "./QuizDetail.css";

const { Title, Text, Paragraph } = Typography;

const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tagNames, setTagNames] = useState({});

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching quiz details for ID:", quizId);
      const response = await getQuizById(quizId);
      console.log("Quiz details response:", response);

      if (response && response.data) {
        const quizData = response.data;
        console.log("Quiz data:", quizData);

        // Store the quiz data
        setQuiz(quizData);

        // Fetch tag names if quiz has tags
        if (quizData.tags && quizData.tags.length > 0) {
          fetchTagNames(quizData.tags);
        }
      } else {
        console.error("Invalid response structure:", response);
        message.error("Failed to load quiz details - no data returned");
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      message.error(error.message || "Failed to load quiz details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTagNames = async (tagIds) => {
    try {
      const tagMapping = {};

      // Fetch each tag individually
      for (const tagId of tagIds) {
        try {
          const response = await TagService.getDetailsTag(tagId);
          if (response && response.data && response.data.name) {
            tagMapping[tagId] = response.data.name;
          } else {
            tagMapping[tagId] = tagId; // Fallback to ID
          }
        } catch (tagError) {
          console.error(`Error fetching tag ${tagId}:`, tagError);
          tagMapping[tagId] = tagId; // Fallback to ID on error
        }
      }

      setTagNames(tagMapping);
    } catch (error) {
      console.error("Error fetching tag names:", error);
    }
  };

  const renderTags = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return null;
    }

    return (
      <div className="quiz-tags">
        {tagIds.map((tagId) => (
          <Tag color="blue" key={tagId}>
            {tagNames[tagId] || tagId}
          </Tag>
        ))}
      </div>
    );
  };

  const renderQuestionOptions = (question) => {
    const { options, type } = question;

    if (!options || !Array.isArray(options)) {
      return <Text type="secondary">No options available</Text>;
    }

    return (
      <List
        size="small"
        dataSource={options}
        renderItem={(option, index) => (
          <List.Item className={option.isCorrect ? "correct-option" : ""}>
            <div className="option-content">
              <Text strong={option.isCorrect}>
                {type === "FILL_IN_BLANK" ? "Correct Answer:" : `Option ${index + 1}:`}
              </Text>
              <Text className="option-text">{option.text}</Text>
              {option.isCorrect && (
                <Tag color="success" className="correct-tag">
                  Correct
                </Tag>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  const goBack = () => {
    // Navigate to the admin manage page with quizzes tab selected
    navigate("/admin/manage?tab=quiz");
    // We can't directly set the active tab through URL, but we'll handle it in ManageSystem component
  };

  if (loading) {
    return (
      <div className="quiz-detail-loading">
        <Spin size="large" />
        <Text>Loading quiz details...</Text>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-detail-error">
        <Title level={3}>Quiz not found</Title>
        <Button type="primary" onClick={goBack} icon={<ArrowLeftOutlined />}>
          Back to Quiz List
        </Button>
      </div>
    );
  }

  return (
    <div className="quiz-detail-container">
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        onClick={goBack}
        className="back-button"
      >
        Back to Quiz List
      </Button>

      <Card className="quiz-header-card">
        <Title level={2}>{quiz.title}</Title>
        <Paragraph>{quiz.description}</Paragraph>

        {renderTags(quiz.tags)}

        <Divider />

        <div className="quiz-meta-info">
          <div className="quiz-meta-item">
            <Text strong>Created by:</Text>
            <Text>{quiz.createdBy?.name || "Unknown"}</Text>
          </div>

          <div className="quiz-meta-item">
            <Text strong>Questions:</Text>
            <Text>{quiz.questions?.length || 0}</Text>
          </div>

          {quiz.timeLimit && (
            <div className="quiz-meta-item">
              <Text strong>Time Limit:</Text>
              <Text>{Math.floor(quiz.timeLimit / 60)} minutes</Text>
            </div>
          )}

          <div className="quiz-meta-item">
            <Text strong>Average Score:</Text>
            <Text>{Math.round(quiz.averageScore || 0)}%</Text>
          </div>

          <div className="quiz-meta-item">
            <Text strong>Total Attempts:</Text>
            <Text>{quiz.totalAttempts || 0}</Text>
          </div>
        </div>
      </Card>

      <Title level={3} className="questions-title">Quiz Questions</Title>

      {quiz.questions && quiz.questions.length > 0 ? (
        quiz.questions.map((question, index) => (
          <Card key={index} className="question-card">
            <Title level={4} className="question-number">
              Question {index + 1}
            </Title>

            <Paragraph className="question-text">
              {question.questionText}
            </Paragraph>

            <div className="question-type">
              <Tag color="processing">
                {question.type === "MULTIPLE_CHOICE"
                  ? "Multiple Choice"
                  : question.type === "TRUE_FALSE"
                    ? "True/False"
                    : "Fill in the Blank"}
              </Tag>
            </div>

            <Divider className="option-divider" />

            <div className="question-options">
              <Title level={5}>Options:</Title>
              {renderQuestionOptions(question)}
            </div>

            {question.explanation && (
              <div className="question-explanation">
                <Title level={5}>Explanation:</Title>
                <Paragraph>{question.explanation}</Paragraph>
              </div>
            )}
          </Card>
        ))
      ) : (
        <Card className="empty-questions-card">
          <Text>This quiz has no questions.</Text>
        </Card>
      )}
    </div>
  );
};

export default QuizDetail;
import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Space, Typography, Progress, Tooltip } from 'antd';
import { ClockCircleOutlined, TrophyOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import * as TagService from '../../services/TagService';
import { useNavigate } from 'react-router-dom';
import './QuizCard.css';

const { Title, Text } = Typography;

const QuizCard = ({ quiz, onStartQuiz, currentUser }) => {
  const [tagNames, setTagNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    _id,
    title,
    description,
    timeLimit,
    questions,
    tags,
    totalAttempts,
    averageScore,
    difficulty,
    category,
    createdBy
  } = quiz;

  // Ensure we have numeric values for display with proper defaults
  const attemptsCount = typeof totalAttempts === 'number' ? totalAttempts : 0;
  const avgScore = typeof averageScore === 'number' ? averageScore : 0;

  // Kiểm tra người dùng có quyền sửa quiz hay không
  const canEdit = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === createdBy);

  useEffect(() => {
    const fetchTagNames = async () => {
      if (!tags || tags.length === 0) return;
      
      setIsLoading(true);
      try {
        const tagMap = {};
        
        // Fetch tags in parallel
        await Promise.all(tags.map(async (tagId) => {
          try {
            const response = await TagService.getDetailsTag(tagId);
            
            // Kiểm tra cấu trúc đúng của dữ liệu trả về
            if (response && response.data && response.data.name) {
              tagMap[tagId] = response.data.name;
            } else if (response && response.name) {
              tagMap[tagId] = response.name;
            } else {
              console.warn('Tag data missing or invalid for ID:', tagId, response);
            }
          } catch (error) {
            console.error(`Error fetching tag ${tagId}:`, error);
          }
        }));
        
        setTagNames(tagMap);
      } catch (error) {
        console.error('Error fetching tag names:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagNames();
  }, [tags]);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'EASY': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HARD': return 'red';
      default: return 'blue';
    }
  };

  const renderTag = (tagId) => {
    if (tagNames[tagId]) {
      return <Tag key={tagId} color="blue" className="tag">{tagNames[tagId]}</Tag>;
    }
    return <Tag key={tagId} color="blue" className="tag">{tagId.substring(0, 8) + '...'}</Tag>;
  };

  const handleEditQuiz = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click của Card
    navigate(`/quiz/edit/${_id}`);
  };

  return (
    <Card
      hoverable
      className="quiz-card"
    >
      <div className="title-container">
        <Title level={4} className="quiz-title">{title}</Title>
        {canEdit && (
          <Tooltip title="Chỉnh sửa Quiz">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={handleEditQuiz}
              aria-label="Edit quiz"
              className="edit-button"
            />
          </Tooltip>
        )}
      </div>
      
      <Text type="secondary" className="quiz-description">{description}</Text>

      <div className="tag-container">
        {tags && tags.map(tagId => renderTag(tagId))}
        <Tag color={getDifficultyColor(difficulty)} className="tag">{difficulty}</Tag>
        {category && <Tag color="purple" className="tag">{category}</Tag>}
      </div>

      <div className="info-section">
        <div className="info-item">
          <ClockCircleOutlined className="icon" />
          <Text>{timeLimit ? `${timeLimit / 60} phút` : 'Không giới hạn'}</Text>
        </div>
        <div className="info-item">
          <UserOutlined className="icon" />
          <Text>{attemptsCount} lượt thử</Text>
        </div>
        <div className="info-item">
          <TrophyOutlined className="icon" />
          <Text>Điểm TB: {avgScore.toFixed(1)}%</Text>
        </div>
      </div>

      <div className="progress-section">
        <Progress
          percent={avgScore}
          size="small"
          status={avgScore >= 60 ? "success" : "exception"}
          format={(percent) => `${percent.toFixed(1)}%`}
        />
      </div>

      <Button 
        type="primary" 
        onClick={() => onStartQuiz(_id)}
        className="start-button"
      >
        Bắt đầu làm bài
      </Button>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
        {questions.length} câu hỏi
      </Text>
    </Card>
  );
};

export default QuizCard; 
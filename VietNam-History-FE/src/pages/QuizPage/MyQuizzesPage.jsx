import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Space, Tag, Typography, message, Spin, Popconfirm, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, TrophyOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getAllQuizzes, deleteQuiz } from '../../services/QuizService';
import * as TagService from '../../services/TagService';
import './MyQuizzesPage.css';

const { Title, Text } = Typography;

const MyQuizzesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [tagNames, setTagNames] = useState({});
  const user = useSelector((state) => state.user);
  const admin = useSelector((state) => state.admin);
  const currentUserId = user?.id || admin?.id;

  useEffect(() => {
    if (!currentUserId) {
      message.error('Vui lòng đăng nhập để xem quiz của bạn');
      navigate('/login');
      return;
    }

    fetchMyQuizzes();
  }, [currentUserId, navigate]);

  const fetchTagNames = async (quizzes) => {
    try {
      // Lấy tất cả các tag ID từ tất cả các quiz
      const allTagIds = new Set();
      quizzes.forEach(quiz => {
        if (quiz.tags && Array.isArray(quiz.tags)) {
          quiz.tags.forEach(tagId => allTagIds.add(tagId));
        }
      });
      
      // Chuyển Set thành Array
      const tagIdsArray = Array.from(allTagIds);
      
      // Tạo map để lưu trữ tên tag theo ID
      const tagMap = {};
      
      // Fetch tên tag cho từng ID
      await Promise.all(tagIdsArray.map(async (tagId) => {
        try {
          const response = await TagService.getDetailsTag(tagId);
          if (response && response.data && response.data.name) {
            tagMap[tagId] = response.data.name;
          } else if (response && response.name) {
            tagMap[tagId] = response.name;
          } else {
            tagMap[tagId] = tagId.substring(0, 8) + '...'; // Fallback
          }
        } catch (error) {
          console.error(`Error fetching tag ${tagId}:`, error);
          tagMap[tagId] = tagId.substring(0, 8) + '...'; // Fallback
        }
      }));
      
      setTagNames(tagMap);
    } catch (error) {
      console.error('Error fetching tag names:', error);
    }
  };

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      // Get all quizzes
      const response = await getAllQuizzes(1, 100); // Get with high limit to ensure we get all
      
      if (response && response.data && response.data.quizzes) {
        // Filter quizzes created by current user
        const userQuizzes = response.data.quizzes.filter(
          quiz => quiz.createdBy && quiz.createdBy._id === currentUserId
        );
        setMyQuizzes(userQuizzes);
        
        // Fetch tag names for all quizzes
        await fetchTagNames(userQuizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      message.error('Không thể tải danh sách quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/quiz/edit/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteQuiz(quizId);
      message.success('Xóa quiz thành công');
      fetchMyQuizzes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quiz:', error);
      message.error('Không thể xóa quiz');
    }
  };

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  const handleViewLeaderboard = (quizId) => {
    navigate(`/quizzes/${quizId}/leaderboard`);
  };

  // Render tag với tên thay vì ID
  const renderTag = (tagId) => {
    const tagName = tagNames[tagId] || tagId.substring(0, 8) + '...';
    return <Tag key={tagId} color="blue" className="quiz-tag">{tagName}</Tag>;
  };

  if (loading) {
    return (
      <div className="my-quizzes-container">
        <div className="loading-container">
          <Spin size="large" />
          <p className="loading-text">Đang tải danh sách quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-quizzes-container">
      <Card className="my-quizzes-card">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="my-quizzes-header">
            <Title level={2} className="my-quizzes-title">Quiz của tôi</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateQuiz}
              className="create-quiz-btn"
            >
              Tạo Quiz mới
            </Button>
          </div>

          {myQuizzes.length === 0 ? (
            <div className="empty-container">
              <Empty
                description="Bạn chưa tạo quiz nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  onClick={handleCreateQuiz}
                  className="empty-create-btn"
                >
                  Tạo Quiz đầu tiên
                </Button>
              </Empty>
            </div>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={myQuizzes}
              renderItem={(quiz) => (
                <List.Item
                  key={quiz._id}
                  className="quiz-list-item"
                  actions={[
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => handleViewQuiz(quiz._id)}
                      className="action-btn view-btn"
                    >
                      Xem
                    </Button>,
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEditQuiz(quiz._id)}
                      className="action-btn edit-btn"
                    >
                      Chỉnh sửa
                    </Button>,
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa quiz này?"
                      onConfirm={() => handleDeleteQuiz(quiz._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        className="action-btn delete-btn"
                      >
                        Xóa
                      </Button>
                    </Popconfirm>,
                    <Button
                      type="text"
                      icon={<TrophyOutlined />}
                      onClick={() => handleViewLeaderboard(quiz._id)}
                      className="action-btn leaderboard-btn"
                    >
                      Bảng xếp hạng
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <a 
                        onClick={() => handleViewQuiz(quiz._id)} 
                        className="quiz-title"
                      >
                        {quiz.title}
                      </a>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text className="quiz-description">{quiz.description}</Text>
                        <div className="quiz-tag-container">
                          {quiz.tags && quiz.tags.map(tagId => renderTag(tagId))}
                        </div>
                        <Space className="quiz-info">
                          <Text type="secondary">
                            Số câu hỏi: {quiz.questions ? quiz.questions.length : 0}
                          </Text>
                          {quiz.timeLimit && (
                            <Text type="secondary">
                              Thời gian: {quiz.timeLimit / 60} phút
                            </Text>
                          )}
                          <Text type="secondary">
                            Ngày tạo: {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default MyQuizzesPage; 
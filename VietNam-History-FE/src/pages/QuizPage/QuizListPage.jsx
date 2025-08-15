import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Row, Col, Input, Select, Button, Empty, Spin, Pagination, Space } from 'antd';
import { useSelector } from 'react-redux';
import QuizCard from '../../components/QuizComponent/QuizCard';
import { getAllQuizzes, getRandomQuizByTag } from '../../services/QuizService';
import * as TagService from '../../services/TagService';
import { SearchOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './QuizListPage.css';
import { message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const QuizListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const admin = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    tag: ''
  });

  // Load tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch quizzes when filters or pagination changes
  useEffect(() => {
    fetchQuizzes();
  }, [pagination.current, filters]);

  // Debug user state on mount
  useEffect(() => {
    console.log('Current user state:', user);
    console.log('Current admin state:', admin);
  }, [user, admin]);

  // Check if user or admin is authenticated
  const isAuthenticated = () => {
    // User authentication
    if (user && (user.id || user._id || user.access_token)) {
      return true;
    }
    
    // Admin authentication
    if (admin && (admin.id || admin._id || admin.access_token)) {
      return true;
    }
    
    return false;
  };

  const handleCreateQuiz = () => {
    if (!isAuthenticated()) {
      message.warning('Please log in to create a quiz!');
      navigate('/login', { state: location.pathname });
    } else if (user.active === false) {
      message.warning('Your account is inactive. You cannot create a quiz at this time.');
    } else {
      navigate('/create-quiz');
    }
  };

  const handleStartQuiz = (quizId) => {
    if (!isAuthenticated()) {
      message.warning('Please log in to take a quiz!');
      navigate('/login', { state: location.pathname });
    } else if (user.active === false) {
      message.warning('Your account is inactive. You cannot take quizzes at this time.');
    } else {
      navigate(`/quiz/${quizId}`);
    }
  };

  const handleRandomQuiz = async () => {
    if (!isAuthenticated()) {
      message.warning('Please log in to take a quiz!');
      navigate('/login', { state: location.pathname });
      return;
    }
    
    try {
      const randomQuiz = await getRandomQuizByTag(selectedTag);
      if (randomQuiz?.data) {
        handleStartQuiz(randomQuiz.data._id);
      } else {
        message.info('No quizzes available for the selected criteria.');
      }
    } catch (error) {
      console.error('Error getting random quiz:', error);
      message.error('Failed to get a random quiz. Please try again.');
    }
  };

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const response = await TagService.getAllTag();
      console.log("Raw tag response:", response);
      
      // Based on the structure you shared: the response contains an array directly
      if (response && Array.isArray(response)) {
        console.log("Using direct array response");
        setTags(response);
      } 
      // If response has a data property containing an array
      else if (response && Array.isArray(response.data)) {
        console.log("Using response.data array");
        setTags(response.data);
      }
      // If response has a data.data property containing an array (nested structure)
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        console.log("Using nested response.data.data array");
        setTags(response.data.data);
      }
      // If response is a single tag object
      else if (response?.data?._id) {
        console.log("Single tag object found");
        setTags([response.data]);
      }
      // Fallback: empty array if no valid structure found
      else {
        console.error("No valid tag data found in response:", response);
        setTags([]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      message.error('Failed to load tags');
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzes(
        pagination.current,
        pagination.pageSize,
        filters.tag,
        filters.search
      );
      
      if (response && response.data && response.data.quizzes) {
        setQuizzes(response.data.quizzes);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0
        }));
      } else {
        console.error('Invalid quiz data structure:', response);
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      message.error('Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTagFilter = (value) => {
    console.log("Selected tag:", value);
    setSelectedTag(value);
    setFilters(prev => ({ ...prev, tag: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <Title level={2} className="quiz-list-title">History Quizzes</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateQuiz}
          className="create-quiz-btn"
        >
          Create Quiz
        </Button>
      </div>

      <div className="filters-container">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="custom-search">
              <Input
                placeholder="Search quizzes..."
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                size="large" 
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by tag"
              style={{ width: '100%' }}
              size="large"
              allowClear
              onChange={handleTagFilter}
              className="filter-select"
              loading={loadingTags}
              optionFilterProp="children"
            >
              {tags.length > 0 ? (
                tags.map(tag => (
                  <Option key={tag._id} value={tag._id}>
                    {tag.name}
                  </Option>
                ))
              ) : (
                <Option disabled>No tags available</Option>
              )}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />} 
              onClick={handleRandomQuiz} 
              disabled={!isAuthenticated()}
              className="random-quiz-btn"
            >
              Start Random Quiz
            </Button>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {quizzes.length > 0 ? (
          <>
            <Row gutter={[16, 24]} className="quizzes-grid">
              {quizzes.map(quiz => (
                <Col xs={24} sm={12} lg={8} key={quiz._id}>
                  <QuizCard
                    quiz={quiz}
                    onStartQuiz={() => handleStartQuiz(quiz._id)}
                    currentUser={user}
                  />
                </Col>
              ))}
            </Row>

            <div className="quiz-pagination">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div className="empty-container">
            <Empty
              description="No quizzes found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default QuizListPage;
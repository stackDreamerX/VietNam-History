import React, { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message, Input, Tag, Typography } from "antd";
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getAllQuizzes, deleteQuiz } from '../../services/QuizService';
import * as TagService from '../../services/TagService';
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import "./QuizAdmin.css";

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

// Add custom styles for the table headers
const tableHeaderStyle = {
  backgroundColor: '#fffde7', // Light yellow background
  fontWeight: 'bold',
  borderBottom: '1px solid #e0e0e0'
};

const QuizAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [tagMap, setTagMap] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchAllTags();
    fetchQuizzes();
  }, [pagination.current, pagination.pageSize]);

  const fetchAllTags = async () => {
    try {
      const response = await TagService.getAllTag();
      if (response && response.data) {
        // Create a map of tag ID to tag name
        const tagMapping = {};
        if (Array.isArray(response.data)) {
          // Handle array of tags
          response.data.forEach(tag => {
            tagMapping[tag._id] = tag.name;
          });
        } else if (response.data._id && response.data.name) {
          // Handle single tag object
          tagMapping[response.data._id] = response.data.name;
        }

        console.log("Tag mapping created:", tagMapping);
        setTagMap(tagMapping);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchTagName = async (tagId) => {
    try {
      const response = await TagService.getDetailsTag(tagId);
      if (response && response.data && response.data.name) {
        setTagMap(prevTagMap => ({
          ...prevTagMap,
          [tagId]: response.data.name
        }));
        return response.data.name;
      }
      return tagId; // Fallback to ID if name not found
    } catch (error) {
      console.error(`Error fetching tag ${tagId}:`, error);
      return tagId; // Fallback to ID on error
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzes(
        pagination.current,
        pagination.pageSize,
        "",
        searchText
      );

      if (response && response.data && response.data.quizzes) {
        setQuizzes(response.data.quizzes);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });

        // Fetch tag names for all unique tag IDs in the quizzes
        const allTagIds = new Set();
        response.data.quizzes.forEach(quiz => {
          if (quiz.tags && Array.isArray(quiz.tags)) {
            quiz.tags.forEach(tagId => allTagIds.add(tagId));
          }
        });

        // Fetch tag details for each unique tag ID
        Array.from(allTagIds).forEach(tagId => {
          fetchTagName(tagId);
        });
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      message.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchQuizzes();
  };

  const handleViewDetails = (quizId) => {
    navigate(`/admin/quiz/${quizId}`);
  };

  const showDeleteConfirm = (quiz) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this quiz?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. All related data including user attempts and leaderboard entries will be permanently deleted.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsDeleting(true);
        setSelectedQuiz(quiz);
        try {
          await deleteQuiz(quiz._id);
          message.success('Quiz deleted successfully');
          // Refresh quizzes list
          queryClient.invalidateQueries(['quizzes']);
          fetchQuizzes();
        } catch (error) {
          console.error('Error deleting quiz:', error);
          message.error('Failed to delete quiz');
        } finally {
          setIsDeleting(false);
          setSelectedQuiz(null);
        }
      },
    });
  };

  const renderCreator = (record) => {
    return record.createdBy?.name || "Unknown";
  };

  const renderTags = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return <Text type="secondary">No tags</Text>;
    }

    return (
      <Space size={[0, 8]} wrap>
        {tagIds.map((tagId) => (
          <Tag color="blue" key={tagId}>
            {tagMap[tagId] || tagId}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderQuestions = (questions) => {
    if (!questions || !Array.isArray(questions)) {
      return 0;
    }
    return questions.length;
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record._id)}>
          {text}
        </a>
      ),
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => renderCreator(record),
    },
    {
      title: "Questions",
      key: "questions",
      render: (_, record) => renderQuestions(record.questions),
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => renderTags(record.tags),
    },
    {
      title: "Attempts",
      dataIndex: "totalAttempts",
      key: "totalAttempts",
      sorter: (a, b) => a.totalAttempts - b.totalAttempts,
    },
    {
      title: "Avg. Score",
      key: "averageScore",
      render: (_, record) => `${Math.round(record.averageScore || 0)}%`,
      sorter: (a, b) => a.averageScore - b.averageScore,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record._id)}
          >
            View
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            loading={isDeleting && selectedQuiz?._id === record._id}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="quiz-admin-container">
      <div className="quiz-admin-header">
        <Title level={3}>Manage Quizzes</Title>
        <Search
          placeholder="Search by title"
          allowClear
          enterButton
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={quizzes}
        rowKey={(record) => record._id}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
        // Add header styling
        className="custom-table"
        headerCell={{ style: tableHeaderStyle }}
        components={{
          header: {
            cell: (props) => <th {...props} style={{ ...props.style, ...tableHeaderStyle }} />
          }
        }}
      />
    </div>
  );
};

export default QuizAdmin;
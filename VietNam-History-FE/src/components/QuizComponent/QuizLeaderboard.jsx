import React from 'react';
import { Card, Table, Typography, Space, Avatar, Tag, Tooltip } from 'antd';
import { TrophyOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './QuizLeaderboard.css';

const { Title, Text } = Typography;

const QuizLeaderboard = ({ leaderboardData, currentUserId, quizInfo }) => {
  // Function to format time (seconds) to MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Xếp hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      render: (rank) => {
        const style = {};
        if (rank === 1) style.color = '#f5bf42'; // Gold
        else if (rank === 2) style.color = '#a0a0a0'; // Silver
        else if (rank === 3) style.color = '#cd7f32'; // Bronze
        
        return (
          <Space>
            {rank <= 3 && <TrophyOutlined style={style} />}
            <Text strong style={style}>{rank}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            src={user.img || user.avatar} 
            style={{ backgroundColor: !user.img && !user.avatar ? '#1890ff' : undefined }}
          />
          <Text strong={user._id === currentUserId}>
            {user.name || 'Người dùng ẩn danh'}
            {user._id === currentUserId && (
              <Tag color="blue" style={{ marginLeft: 8 }}>Bạn</Tag>
            )}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      sorter: (a, b) => a.score - b.score,
      render: (score, record) => (
        <Tooltip title={`${record.percentageScore.toFixed(1)}%`}>
          <Text strong>{score}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      width: 120,
      sorter: (a, b) => a.timeSpent - b.timeSpent,
      render: (seconds) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatTime(seconds)}</Text>
        </Space>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <Card className="leaderboard-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {quizInfo && (
          <div className="quiz-info">
            <Title level={4}>{quizInfo.title}</Title>
            {quizInfo.description && (
              <Text type="secondary">{quizInfo.description}</Text>
            )}
          </div>
        )}

        <Table
          dataSource={leaderboardData.map((item, index) => ({
            ...item,
            rank: index + 1,
            key: item._id,
          }))}
          columns={columns}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => 
            record.user && record.user._id === currentUserId ? 'highlight-row' : ''
          }
        />
      </Space>
    </Card>
  );
};

export default QuizLeaderboard; 
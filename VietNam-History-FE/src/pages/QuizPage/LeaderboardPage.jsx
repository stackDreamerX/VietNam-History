import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Typography, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getLeaderboard, getQuizById } from '../../services/QuizService';
import QuizLeaderboard from '../../components/QuizComponent/QuizLeaderboard';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const LeaderboardPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [userBestAttempt, setUserBestAttempt] = useState(null);
  const user = useSelector((state) => state.user);
  const currentUserId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leaderboard data which now includes quiz info
        const leaderboardResponse = await getLeaderboard(quizId);
        
        if (leaderboardResponse && leaderboardResponse.data) {
          // Extract the entries and quiz info from the response
          const { entries, quiz, userBestAttempt } = leaderboardResponse.data;
          setLeaderboardData(entries || []);
          setQuizInfo(quiz || null);
          setUserBestAttempt(userBestAttempt || null);
        } else {
          message.error('Không thể tải bảng xếp hạng');
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        message.error('Có lỗi xảy ra khi tải bảng xếp hạng');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchData();
    }
  }, [quizId]);

  const handleBack = () => {
    navigate(`/quiz/${quizId}`);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Đang tải bảng xếp hạng...</p>
      </Card>
    );
  }

  return (
    <div className="container py-4">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            Quay lại bài kiểm tra
          </Button>
        </Space>

        {quizInfo && (
          <Title level={2} style={{ textAlign: 'center' }}>
            {quizInfo.title} - Bảng xếp hạng
          </Title>
        )}

        {userBestAttempt && (
          <Card style={{ marginBottom: 24 }}>
            <Space direction="vertical">
              <Title level={5}>Kết quả tốt nhất của bạn</Title>
              <Space size="large">
                <Text>Điểm: <Text strong>{userBestAttempt.score}</Text></Text>
                <Text>
                  Phần trăm: <Text strong>{userBestAttempt.percentageScore.toFixed(1)}%</Text>
                </Text>
                <Text>
                  Thời gian: <Text strong>{formatTime(userBestAttempt.timeSpent)}</Text>
                </Text>
                <Text>
                  Ngày: {new Date(userBestAttempt.completedAt).toLocaleDateString('vi-VN')}
                </Text>
              </Space>
            </Space>
          </Card>
        )}

        {leaderboardData.length > 0 ? (
          <QuizLeaderboard 
            leaderboardData={leaderboardData} 
            currentUserId={currentUserId}
            quizInfo={quizInfo} 
          />
        ) : (
          <Card style={{ textAlign: 'center', padding: '30px' }}>
            <Title level={4}>Chưa có dữ liệu bảng xếp hạng</Title>
            <p>Hãy là người đầu tiên hoàn thành bài kiểm tra này!</p>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default LeaderboardPage; 
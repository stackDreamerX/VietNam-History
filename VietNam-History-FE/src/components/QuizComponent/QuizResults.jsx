import React from 'react';
import { Card, Typography, Space, Progress, List, Tag, Button, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const QuizResults = ({
  quizAttempt,
  quiz,
  onRetry,
  onViewLeaderboard,
  onReview
}) => {
  if (!quizAttempt) {
    return (
      <Card>
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Title level={3}>Đang tải kết quả...</Title>
          <Button onClick={onRetry}>Quay lại</Button>
        </Space>
      </Card>
    );
  }

  const {
    score = 0,
    percentageScore = 0,
    timeSpent = 0,
    answers = [],
    isPassed = false,
    status = 'COMPLETED'
  } = quizAttempt;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>
            {isPassed ? 'Chúc mừng!' : 'Cố gắng lần sau nhé!'}
          </Title>
          <Text type="secondary">
            {status === 'COMPLETED'
              ? 'Bạn đã hoàn thành bài kiểm tra'
              : status === 'TIMED_OUT'
                ? 'Hết thời gian làm bài'
                : 'Bài làm chưa hoàn thành'}
          </Text>
        </div>

        <Card style={{ background: '#f5f5f5', marginBottom: 24 }}>
          <Space size="large" style={{ justifyContent: 'center', width: '100%' }}>
            <Space direction="vertical" align="center">
      <Progress
        type="circle"
                percent={Math.round(percentageScore)}
                format={(percent) => (
                  <span style={{ color: getScoreColor(percent) }}>
                    {percent}%
                  </span>
                )}
                strokeColor={getScoreColor(percentageScore)}
              />
              <Text strong>Tổng điểm: {score}</Text>
            </Space>

            <Divider type="vertical" style={{ height: 100 }} />

            <Space direction="vertical">
              <Space>
                <ClockCircleOutlined />
                <Text>Thời gian: {formatTime(timeSpent)}</Text>
              </Space>
              <Space>
                <TrophyOutlined />
                <Text>
                  {answers.filter(a => a.isCorrect).length}/{answers.length} câu đúng
                </Text>
              </Space>
              <Tag color={isPassed ? 'success' : 'error'}>
                {isPassed ? 'Đạt' : 'Chưa đạt'}
              </Tag>
            </Space>
          </Space>
        </Card>

        {quiz?.allowReview && answers.length > 0 && (
          <List
            itemLayout="vertical"
            dataSource={answers}
            renderItem={(answer, index) => {
              const question = quiz.questions[answer.questionIndex];
              if (!question) return null;

              return (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      {answer.isCorrect
                        ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        : <CloseCircleOutlined style={{ color: '#f5222d' }} />
                      }
                      <Text strong>Câu {index + 1}: {question.questionText}</Text>
                    </Space>

                    <div style={{ marginLeft: 24 }}>
                      <Text>
                        Câu trả lời của bạn: {
                          question.type === 'FILL_IN_BLANK'
                            ? answer.answer
                            : question.options[answer.selectedOption]?.text || 'Không có câu trả lời'
                        }
                      </Text>
                      {!answer.isCorrect && (
                        <Paragraph type="success" style={{ marginTop: 8 }}>
                          Đáp án đúng: {
                            question.type === 'FILL_IN_BLANK'
                              ? question.options[0]?.text
                              : question.options.find(opt => opt.isCorrect)?.text || 'Không có đáp án'
                          }
                        </Paragraph>
                      )}
                      {question.explanation && (
                        <Paragraph type="secondary" style={{ marginTop: 8 }}>
                          Giải thích: {question.explanation}
                        </Paragraph>
                      )}
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        )}

        <Space style={{ marginTop: 24, justifyContent: 'center', width: '100%' }}>
          <Button type="primary" onClick={onRetry}>
            Làm lại
        </Button>
        <Button onClick={onViewLeaderboard}>
            Xem bảng xếp hạng
        </Button>

        </Space>
      </Space>
    </Card>
  );
};

export default QuizResults;
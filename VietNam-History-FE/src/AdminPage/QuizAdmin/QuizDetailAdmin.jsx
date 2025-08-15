import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Tag, Descriptions, List, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getQuizById } from '../../services/QuizService';
import * as TagService from '../../services/TagService';

const { Title, Text } = Typography;

const QuizDetailAdmin = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId)
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: TagService.getAllTag
  });

  const getTagNames = (tagIds) => {
    if (!tagsData?.data) return [];
    return tagIds.map(tagId => {
      const tag = tagsData.data.find(t => t._id === tagId);
      return tag ? tag.name : 'Unknown';
    });
  };

  if (isLoadingQuiz) {
    return <Spin size="large" />;
  }

  if (!quiz?.data) {
    return <div>Quiz not found</div>;
  }

  const quizData = quiz.data;

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>{quizData.title}</Title>
          <Button onClick={() => navigate('/admin/quiz')}>Back to List</Button>
        </div>

        <Card>
          <Descriptions title="Quiz Information" bordered>
            <Descriptions.Item label="Status">
              <Tag color={quizData.active ? 'green' : 'red'}>
                {quizData.active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Time Limit">
              {quizData.timeLimit ? `${quizData.timeLimit} minutes` : 'No time limit'}
            </Descriptions.Item>
            <Descriptions.Item label="Total Questions">
              {quizData.questions?.length || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              <Space size={[0, 8]} wrap>
                {getTagNames(quizData.tags || []).map((tag) => (
                  <Tag color="blue" key={tag}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {quizData.description}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Questions">
          <List
            itemLayout="vertical"
            dataSource={quizData.questions || []}
            renderItem={(question, index) => (
              <List.Item>
                <Card type="inner" title={`Question ${index + 1}`}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Question: </Text>
                    <Text>{question.content}</Text>
                    
                    <Text strong>Type: </Text>
                    <Text>{question.type}</Text>

                    {question.type === 'multiple_choice' && (
                      <>
                        <Text strong>Options:</Text>
                        <List
                          dataSource={question.options}
                          renderItem={(option) => (
                            <List.Item>
                              <Text mark={option === question.correctAnswer}>
                                {option}
                                {option === question.correctAnswer && ' (Correct Answer)'}
                              </Text>
                            </List.Item>
                          )}
                        />
                      </>
                    )}

                    {question.type === 'true_false' && (
                      <>
                        <Text strong>Correct Answer: </Text>
                        <Text>{question.correctAnswer}</Text>
                      </>
                    )}

                    {question.explanation && (
                      <>
                        <Text strong>Explanation: </Text>
                        <Text type="secondary">{question.explanation}</Text>
                      </>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  );
};

export default QuizDetailAdmin; 
import React, { useState, useEffect } from 'react';
import { Card, Tag, Space, Typography, Button, Tooltip } from 'antd';
import { ClockCircleOutlined, UserOutlined, TrophyOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as TagService from '../../services/TagService';

const { Title, Text } = Typography;

const QuizCard = ({ quiz, currentUser }) => {
    const navigate = useNavigate();
    const [tagNames, setTagNames] = useState({});

    const {
        _id,
        title,
        description,
        timeLimit,
        questions,
        tags,
        createdBy,
        totalAttempts,
        averageScore
    } = quiz;

    // Kiểm tra người dùng có quyền sửa quiz hay không
    const canEdit = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === createdBy);

    useEffect(() => {
        const fetchTagNames = async () => {
            if (!tags || tags.length === 0) return;
            
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
            }
        };

        fetchTagNames();
    }, [tags]);

    const renderTag = (tagId) => {
        if (tagNames[tagId]) {
            return <Tag key={tagId} color="blue">{tagNames[tagId]}</Tag>;
        }
        return <Tag key={tagId} color="blue">{tagId.substring(0, 8) + '...'}</Tag>;
    };

    const handleEditQuiz = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click của Card
        navigate(`/quiz/edit/${_id}`);
    };

    const handleCardClick = () => {
        navigate(`/quiz/${_id}`);
    };

    return (
        <Card
            hoverable
            className="quiz-card"
            onClick={handleCardClick}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Title level={4}>{title}</Title>
                    {canEdit && (
                        <Tooltip title="Chỉnh sửa Quiz">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={handleEditQuiz}
                            aria-label="Edit quiz"
                          />
                        </Tooltip>
                    )}
                </div>
                
                <Text type="secondary">{description}</Text>

                <Space wrap>
                    {tags?.map(tagId => renderTag(tagId))}
                </Space>

                <Space split={<div style={{ width: 1, background: '#f0f0f0', height: 14 }} />}>
                    <Space>
                        <ClockCircleOutlined />
                        <Text>{timeLimit ? `${timeLimit / 60} minutes` : 'No time limit'}</Text>
                    </Space>
                    <Text><strong>{questions?.length || 0}</strong> questions</Text>
                </Space>

                <Space split={<div style={{ width: 1, background: '#f0f0f0', height: 14 }} />}>
                    <Space>
                        <UserOutlined />
                        <Text>By {createdBy?.name || 'Unknown'}</Text>
                    </Space>
                    <Space>
                        <TrophyOutlined />
                        <Text>{totalAttempts || 0} attempts</Text>
                    </Space>
                </Space>

                {averageScore !== undefined && (
                    <Text type="secondary">
                        Average Score: {averageScore.toFixed(1)}%
                    </Text>
                )}

                <Button type="primary" block onClick={handleCardClick}>
                    Start Quiz
                </Button>
            </Space>
        </Card>
    );
};

export default QuizCard; 
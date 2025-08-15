import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Space, Typography, Empty, Pagination, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import QuizCard from '../components/Quiz/QuizCard';
import QuizService from '../services/QuizService';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const QuizListPage = () => {
    const user = useSelector((state) => state.user);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        tag: ''
    });

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await QuizService.getAllQuizzes(
                pagination.current,
                pagination.pageSize,
                filters.tag,
                filters.search
            );
            setQuizzes(response.data.quizzes);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total
            }));
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [pagination.current, filters]);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleTagFilter = (value) => {
        setFilters(prev => ({ ...prev, tag: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current: page }));
    };

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>History Quizzes</Title>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={16}>
                        <Search
                            placeholder="Search quizzes..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by tag"
                            style={{ width: '100%' }}
                            size="large"
                            allowClear
                            onChange={handleTagFilter}
                        >
                            <Option value="history">History</Option>
                            <Option value="vietnam">Vietnam</Option>
                            <Option value="culture">Culture</Option>
                        </Select>
                    </Col>
                </Row>

                <Spin spinning={loading}>
                    {quizzes.length > 0 ? (
                        <>
                            <Row gutter={[16, 16]}>
                                {quizzes.map(quiz => (
                                    <Col xs={24} sm={12} lg={8} key={quiz._id}>
                                        <QuizCard quiz={quiz} currentUser={user} />
                                    </Col>
                                ))}
                            </Row>

                            <Row justify="center" style={{ marginTop: '24px' }}>
                                <Pagination
                                    current={pagination.current}
                                    pageSize={pagination.pageSize}
                                    total={pagination.total}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                />
                            </Row>
                        </>
                    ) : (
                        <Empty
                            description="No quizzes found"
                            style={{ margin: '48px 0' }}
                        />
                    )}
                </Spin>
            </Space>
        </div>
    );
};

export default QuizListPage; 
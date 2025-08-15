import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Space,
    Typography,
    Button,
    Modal,
    Progress,
    message,
    Spin
} from 'antd';
import {
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import QuizService from '../services/QuizService';
import QuizQuestion from '../components/Quiz/QuizQuestion';
import QuizResults from '../components/Quiz/QuizResults';

const { Title, Text } = Typography;
const { confirm } = Modal;

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [quizAttempt, setQuizAttempt] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await QuizService.getQuizById(id);
                setQuiz(response.data);
                setAnswers(new Array(response.data.questions.length).fill(null));
                if (response.data.timeLimit) {
                    setTimeLeft(response.data.timeLimit);
                }
            } catch (error) {
                message.error('Failed to load quiz');
                navigate('/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    // Timer logic
    useEffect(() => {
        if (startTime && !quizAttempt) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [startTime, quiz, quizAttempt]);

    const handleStartQuiz = () => {
        setStartTime(Date.now());
        if (quiz.timeLimit) {
            setTimeLeft(quiz.timeLimit);
        }
    };

    const handleAnswerSelect = (questionIndex, selectedOption) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = selectedOption;
            return newAnswers;
        });
    };

    const handleSubmit = async () => {
        try {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const attemptData = {
                answers: answers.map((selectedOption, index) => ({
                    questionIndex: index,
                    selectedOption: selectedOption || 0
                })),
                timeSpent
            };

            const result = await QuizService.submitQuizAttempt(quiz._id, attemptData);
            setQuizAttempt(result.data.attempt);
        } catch (error) {
            message.error('Failed to submit quiz');
        }
    };

    const handleConfirmSubmit = () => {
        const unanswered = answers.filter(a => a === null).length;
        confirm({
            title: 'Submit Quiz?',
            icon: <ExclamationCircleOutlined />,
            content: unanswered > 0 
                ? `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
                : 'Are you sure you want to submit your answers?',
            onOk: handleSubmit
        });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={2}>{quiz.title}</Title>
                        <Text>{quiz.description}</Text>

                        {timeLeft !== null && (
                            <Space>
                                <ClockCircleOutlined />
                                <Text strong>{formatTime(timeLeft)}</Text>
                            </Space>
                        )}

                        <Progress
                            percent={Math.round((answers.filter(a => a !== null).length / answers.length) * 100)}
                            format={percent => `${answers.filter(a => a !== null).length}/${answers.length} answered`}
                        />
                    </Space>
                </Card>

                {!startTime && !quizAttempt && (
                    <Card>
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <Title level={3}>Ready to start?</Title>
                            <Button type="primary" size="large" onClick={handleStartQuiz}>
                                Start Quiz
                            </Button>
                        </Space>
                    </Card>
                )}

                {startTime && !quizAttempt && (
                    <>
                        <QuizQuestion
                            question={quiz.questions[currentQuestionIndex]}
                            questionIndex={currentQuestionIndex}
                            selectedAnswer={answers[currentQuestionIndex]}
                            onAnswerSelect={handleAnswerSelect}
                            showResults={false}
                        />

                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>
                            
                            {currentQuestionIndex === quiz.questions.length - 1 ? (
                                <Button type="primary" onClick={handleConfirmSubmit}>
                                    Submit Quiz
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            )}
                        </Space>
                    </>
                )}

                {quizAttempt && !showLeaderboard && (
                    <QuizResults
                        quizAttempt={quizAttempt}
                        onReviewAnswers={() => setCurrentQuestionIndex(0)}
                        onRetakeQuiz={() => {
                            setQuizAttempt(null);
                            setStartTime(null);
                            setAnswers(new Array(quiz.questions.length).fill(null));
                        }}
                        onViewLeaderboard={() => setShowLeaderboard(true)}
                    />
                )}
            </Space>
        </div>
    );
};

export default QuizPage; 
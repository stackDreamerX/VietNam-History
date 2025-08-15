import React from 'react';
import { Card, Result, Space, Statistic, Button, Typography, Progress } from 'antd';
import {
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const QuizResults = ({
    quizAttempt,
    onReviewAnswers,
    onRetakeQuiz,
    onViewLeaderboard
}) => {
    const {
        score,
        timeSpent,
        answers,
        isPassed,
        percentageScore
    } = quizAttempt;

    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = answers.length;
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Result
                    icon={isPassed ? <TrophyOutlined /> : <CloseCircleOutlined />}
                    status={isPassed ? "success" : "error"}
                    title={isPassed ? "Congratulations!" : "Quiz Completed"}
                    subTitle={
                        isPassed
                            ? "You've successfully passed the quiz!"
                            : "Keep practicing to improve your score."
                    }
                />

                <div style={{ textAlign: 'center' }}>
                    <Progress
                        type="circle"
                        percent={percentageScore}
                        format={(percent) => `${percent}%`}
                        status={isPassed ? "success" : "exception"}
                    />
                </div>

                <Space size="large" wrap style={{ justifyContent: 'center' }}>
                    <Statistic
                        title="Correct Answers"
                        value={`${correctAnswers}/${totalQuestions}`}
                        prefix={<CheckCircleOutlined />}
                    />
                    <Statistic
                        title="Time Taken"
                        value={formatTime(timeSpent)}
                        prefix={<ClockCircleOutlined />}
                    />
                </Space>

                <Space style={{ width: '100%', justifyContent: 'center' }}>
                    <Button type="primary" onClick={onReviewAnswers}>
                        Review Answers
                    </Button>
                    <Button onClick={onRetakeQuiz}>
                        Retake Quiz
                    </Button>
                    <Button type="link" onClick={onViewLeaderboard}>
                        View Leaderboard
                    </Button>
                </Space>
            </Space>
        </Card>
    );
};

export default QuizResults; 
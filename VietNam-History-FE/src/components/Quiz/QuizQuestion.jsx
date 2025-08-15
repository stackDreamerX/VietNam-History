import React from 'react';
import { Card, Radio, Space, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

const QuizQuestion = ({
    question,
    questionIndex,
    selectedAnswer,
    onAnswerSelect,
    showResults,
    isReview
}) => {
    const {
        questionText,
        options,
        explanation,
        type
    } = question;

    const handleOptionSelect = (e) => {
        if (!showResults) {
            onAnswerSelect(questionIndex, e.target.value);
        }
    };

    const getOptionStyle = (optionIndex) => {
        if (!showResults) return {};

        const option = options[optionIndex];
        if (option.isCorrect) {
            return { color: '#52c41a' }; // Green for correct answer
        }
        if (selectedAnswer === optionIndex && !option.isCorrect) {
            return { color: '#f5222d' }; // Red for wrong selected answer
        }
        return {};
    };

    return (
        <Card className="quiz-question" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Title level={4}>Question {questionIndex + 1}</Title>
                <Text strong>{questionText}</Text>

                <Radio.Group
                    onChange={handleOptionSelect}
                    value={selectedAnswer}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {options.map((option, index) => (
                            <Radio
                                key={index}
                                value={index}
                                style={getOptionStyle(index)}
                                disabled={showResults}
                            >
                                {option.text}
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>

                {showResults && explanation && (
                    <Alert
                        message="Explanation"
                        description={explanation}
                        type="info"
                        showIcon
                    />
                )}

                {showResults && (
                    <Alert
                        message={
                            options[selectedAnswer]?.isCorrect
                                ? "Correct!"
                                : "Incorrect"
                        }
                        type={options[selectedAnswer]?.isCorrect ? "success" : "error"}
                        showIcon
                    />
                )}
            </Space>
        </Card>
    );
};

export default QuizQuestion; 
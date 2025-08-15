import React from 'react';
import { Popover } from 'antd';
import parse from 'html-react-parser';
import './AnswerBox.css'; // Đảm bảo file CSS này hỗ trợ cả giao diện mới

const QuestionAnswerBox = ({
    questionTitle,
    questionTags,
    questionDate,
    answerContent,
    answerDate,
    onDeleteAnswer,
    isHiddenAnswer,
    onClick
}) => {

    return (
        <div className="question-answer-box">
            {/* Phần câu hỏi */}
            <div className="question-section" onClick={onClick}>
                <div className="title-and-tags">
                    <h3 className="question_title">{parse(questionTitle)}</h3>
                    <div className="tags-container">
                        {questionTags.map((tag, index) => (
                            <span key={index} className="tag-item">{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="date-container">
                    <span className="date-item">{questionDate}</span>
                </div>
                {isHiddenAnswer === false && (
                    <div className="hidden-notice" style={{ color: "#ff0000", fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}>
                        This answer was hidden
                    </div>
                )}

            </div>

            <div className="divider"></div>

            {/* Phần câu trả lời */}
            <div className="answer-section">
                <div className='answer-detail'>
                    <h4>Answer:</h4>
                    
                    <button className='btn btn-sm btn-light'
                        onClick={onDeleteAnswer}>
                        <i className="bi bi-trash text-danger"></i>
                    </button>
                    
                </div>
                <p className="answer-content">{parse(answerContent)}</p>
                <div className="answer-date-container">
                    <span className="date-item">{answerDate}</span>
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswerBox;

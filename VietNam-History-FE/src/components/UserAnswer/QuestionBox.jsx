import React from 'react';
import './QuestionBox.css';

const QuestionBox = ({ title, tags, date, comments, likes }) => {
  // Format the date (you can improve this further by using a date library like date-fns)
  const formattedDate = new Date(date).toLocaleString();

  return (
    <div className="question-box">
      <div className="question-content">
        <div className="question-details">
          <span className="detail-item">
            {likes} <i className="bi bi-hand-thumbs-up like-icon"></i>
          </span>
          <span className="detail-item">{comments} comments</span>
        </div>
        <div className="title-and-tags">
          <h3 className="question_title">{title}</h3>
          {tags.length > 0 && (
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag-item">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="date-container">
          <span className="date-item">answered {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionBox;

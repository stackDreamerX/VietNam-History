import React from 'react';
import './TagsBoxComponent.css';

const TagsBoxComponent = ({ tagsname, description, quantity, customStyle }) => {
  const defaultStyle = {
    backgroundColor: "#FFF8DC", // Light wheat color
    borderColor: "#D4A017",     // Gold color
  };

  // Combine default style with any custom styles passed as props
  const cardStyle = { ...defaultStyle, ...(customStyle || {}) };

  return (
    <div className="card shadow-sm" style={cardStyle}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title mb-0" style={{ color: "#B8860B" }}>{tagsname}</h5>
        </div>
        <p className="card-text" style={{ fontSize: "14px", color: "#000000" }}>
          {description}
        </p>
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {quantity} Posts
        </span>
      </div>
    </div>
  );
};

export default TagsBoxComponent;

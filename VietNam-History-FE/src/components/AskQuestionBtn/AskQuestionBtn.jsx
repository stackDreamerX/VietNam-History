import React from 'react';

const AskQuestionBtn = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        backgroundColor: '#023E73',
        color: '#FFFFFF',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '700',
        marginRight: '20px',
        transition: 'background-color 0.3s',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#021E54')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#023E73')}
    >
      Ask Question
    </button>
  );
};

export default AskQuestionBtn;

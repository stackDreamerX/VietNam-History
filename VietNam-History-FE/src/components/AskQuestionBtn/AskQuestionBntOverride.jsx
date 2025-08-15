import React from 'react';

const AskQuestionBtnOverride = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        backgroundColor: '#78ACD9',
        color: '#111111',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        marginLeft: 'auto', display: 'block',
        cursor: 'pointer',
        fontSize: '16px',
        width: '142',
        height: '40',
        transition: 'background-color 0.3s',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#021E54')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#78ACD9')}
    >
      Ask Question
    </button>
  );
};

export default AskQuestionBtnOverride;

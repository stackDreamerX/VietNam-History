import React from 'react';

const ApplyBtn = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        backgroundColor: '#EDBE00',
        color: '#000000',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '700',
        marginRight: '20px',
        transition: 'background-color 0.3s',
      }}
    >
      Apply Filter
    </button>
  );
};

export default ApplyBtn;

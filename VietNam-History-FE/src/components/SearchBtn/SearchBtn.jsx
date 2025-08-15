import React from 'react';

const SearchBtn = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        backgroundColor: '#EDBE00',
        color: '#FFFFFF',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '700',
        marginRight: '20px',
        transition: 'background-color 0.3s',
        marginLeft: '20px'
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#021E54')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#023E73')}
    >
      Search
    </button>
  );
};

export default SearchBtn;

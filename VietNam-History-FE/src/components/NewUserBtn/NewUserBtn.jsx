import React from 'react';

const NewAdminBtn = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        backgroundColor: '#78ACD9',
        color: '#111111',
        padding: '10px 20px',
        borderColor: '#023E73',
        borderRadius: '10px',
        marginLeft: 'auto', display: 'block',
        cursor: 'pointer',
        fontSize: '16px',
        width: '142',
        height: '43px',
        transition: 'background-color 0.3s',
        
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#78ACD9')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
    >
      New Admin
    </button>
  );
};

export default NewAdminBtn;

import React, { useState } from 'react';

const ProfileReputation = ({ totalPoints, date, details }) => {
  const [collapse, setCollapse] = useState(false);

  const toggleCollapse = () => setCollapse(!collapse);

  return (
    <div className="container">
          <div className="card" >
            <div className="card-header">
              <h5>
                <div className="row">
                <div className="col-1">
                <button
                  className="btn btn-sm  "
                  onClick={toggleCollapse}
                >
                  {collapse ? <i class="bi bi-caret-up-fill"></i> : <i class="bi bi-caret-down-fill"></i>}
                </button>
                </div>
                <div className="col" >
                Tổng điểm: {totalPoints} 
                </div>
                <div className="col" >
                Ngày: {date}
                </div>
                </div>
              </h5>
            </div>
            <div className={`collapse ${collapse ? 'show' : ''}`}>
              <div className="card-body">
                <div>
                  {details.map((item, index) => (
                    <li key={index} className={`text-${item.type === 'add' ? 'primary' : 'danger'}`}>
                      {item.type === 'add' ? '+' : '-'} {item.points} điểm: {item.description}
                    </li>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

  );
};

export default ProfileReputation;

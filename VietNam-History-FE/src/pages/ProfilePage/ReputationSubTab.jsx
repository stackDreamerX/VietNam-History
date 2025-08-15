import React from 'react';
import ProfileReputation from '../../components/ProfileReputation/ProfileReputation';

const ReputationSubTab = () => {

    const dataReputation = {
        totalPoints: 100,
        date: '2024-11-18',
        details: [
            { type: 'add', points: 20, description: 'Điểm thưởng' },
            { type: 'subtract', points: 10, description: 'Điểm trừ vì vi phạm' },
            { type: 'add', points: 30, description: 'Điểm thưởng do hoàn thành nhiệm vụ' },
        ]
    }

    return (
        <div>
            <h3 className="title-profile" style={{ marginLeft: '12px', marginBottom: '20px' }}>Reputation 280</h3>
            {[...Array(5)].map((_, index) => (
                <ProfileReputation
                    key={index}
                    totalPoints={dataReputation.totalPoints}
                    date={dataReputation.date}
                    details={dataReputation.details}
                />
            ))}
        </div>
    )
}

export default ReputationSubTab
import React from 'react';
import ResponsesBox from '../ResponsesBox/ResponsesBox';

const responses = [
    {
      id: 1,
      title: "Câu hỏi 1",
      tags: ["javascript", "css"],
      date: "14:59, 01/11/2024",
      likes: 20,
    },
    {
        id: 2,
        title: "Câu hỏi 1",
        tags: ["javascript", "css"],
        date: "14:59, 01/11/2024",
        likes: 20,
      },
    
      {
        id: 3,
        title: "Câu hỏi 1",
        tags: ["javascript", "css"],
        date: "14:59, 01/11/2024",
        likes: 20,
      },
      {
        id: 4,
        title: "Câu hỏi 1",
        tags: ["javascript", "css"],
        date: "14:59, 01/11/2024",
        likes: 20,
      },
      {
        id: 5,
        title: "Câu hỏi 1",
        tags: ["javascript", "css"],
        date: "14:59, 01/11/2024",
        likes: 20,
      },
      {
        id: 6,
        title: "Câu hỏi 1",
        tags: ["javascript", "css"],
        date: "14:59, 01/11/2024",
        likes: 20,
      },
  ];
const ResponsesHolder = () => {
        return (
          <div style={{ padding: '20px' }}>
            {responses.map((responses) => (
              <ResponsesBox
                key={responses.id}
                title={responses.title}
                tags={responses.tags}
                date={responses.date}
                likes={responses.likes} 

              />
            ))}
          </div>
        );
      };
      

export default ResponsesHolder;

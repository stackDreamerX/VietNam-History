import React, { useEffect, useState } from "react";
import QuestionHolder from "../../components/UserQuestion/QuestionHolder";
import "../../css/QuestionSubTab.css";
import * as QuestionService from "../../services/QuestionService";
import { useSelector } from "react-redux";


const QuestionSubTab = (questionQuantity) => {
  const [questionCount, setQuestionCount] = useState(0); 
  const [statusMessage, setStatusMessage] = useState(null);
  const user = useSelector((state) => state.user);
  

  useEffect(() => {
      // Hàm lấy số lượng câu hỏi
      const fetchQuestionCount = async () => {
        try {
          const response = await QuestionService.getQuestionsByUserId(user.id);
        
          setQuestionCount(response?.total || 0); 
        } catch (error) {
          setStatusMessage({
            type: "Error",
            message: error.message || "Đã xảy ra lỗi khi tải dữ liệu.",
          });
        }
      };
    
      // Gọi hàm fetch khi userId thay đổi
      if (user.id) {
        fetchQuestionCount();
      }
    
    }, [user.id]);

  return (
    <div>
      <div className="title">
        <h3>Questions {questionCount} </h3>
      </div>
      <div className="question-list">
        <QuestionHolder></QuestionHolder>
      </div>
    </div>
  );
};

export default QuestionSubTab;

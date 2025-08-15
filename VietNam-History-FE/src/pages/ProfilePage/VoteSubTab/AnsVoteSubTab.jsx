import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import * as AnswerVoteService from "../../../services/AnswerVoteService";

const AnsVoteSubTab = () => {
  const user = useSelector((state) => state.user);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm lấy câu hỏi đã được vote từ API
  const fetchAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AnswerVoteService.getVotesAndAnswersFromUser(user?.id);
      if (response.status === 'OK') {
        setAnswers(response.data);
      } else {
        setError('Không thể tải câu hỏi');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải câu hỏi');
    } finally {
      setLoading(false);
    }
  };


  // Khi userId thay đổi, fetch lại câu hỏi
  useEffect(() => {
    if (user?.id) {
      fetchAnswers();
    }
  }, [user?.id]);

  // Hiển thị trạng thái loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Chuyển hướng khi click vào câu hỏi
  const handleQuestionClick = (questionId) => {
    navigate(`/question-detail/${questionId}`);
  };

  return (
    <div>
      <div className="title">
        <h3>VOTED</h3>
      </div>
      <div className="container my-4">
        {answers.map((vote, index) => (
          // Kiểm tra nếu có tiêu đề câu hỏi mới render vote
          vote.question?.title && (
            <div
              key={index}
              className="d-flex flex-row align-items-center border rounded p-3 mb-3"
              style={{
                backgroundColor: "#F2F5FF", // Màu xanh nhạt giống ảnh
                borderColor: "#d0e6f5", // Màu viền nhẹ để hài hòa với nền
              }}
              onClick={() => handleQuestionClick(vote.question._id)}
            >
              {/* Phần loại vote */}
              <div className="me-4" style={{ width: "100px", fontWeight: "bold" }}>
                {vote.voteType === true ? (
                  <span className="text-success">upvote</span>
                ) : (
                  <span className="text-danger">downvote</span>
                )}
              </div>
  
              {/* Nội dung câu hỏi */}
              <div className="flex-grow-1">
                <div className="question_title">{vote.question.title}</div>
                <div className="mt-2">
                  Answer of <span style={{ fontWeight: 'bold' }}>{vote.userAns.name}</span>
                </div>
              </div>
  
              {/* Thời gian */}
              <div
                className="text-muted text-end"
                style={{ fontSize: "15px", minWidth: "150px" }}
              >
                voted at {new Date(vote.voteCreatedAt).toLocaleString()}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
  
};

export default AnsVoteSubTab;
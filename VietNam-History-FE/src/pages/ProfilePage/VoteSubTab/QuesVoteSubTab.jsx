import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import * as QuestionVoteService from "../../../services/QuestionVoteService";
import * as TagService from "../../../services/TagService";

const QuesVoteSubTab = () => {
  const user = useSelector((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState({});
  const navigate = useNavigate();

  // Hàm lấy câu hỏi đã được vote từ API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionVoteService.getVotesAndQuestionsFromUser(user?.id);
      if (response.status === 'OK') {
        setQuestions(response.data);
      } else {
        setError('Không thể tải câu hỏi');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy chi tiết tag từ ID
  const getTagDetails = async (tagId) => {
    try {
      const res = await TagService.getDetailsTag(tagId);
      return res.data;
    } catch (error) {
      console.error("Error fetching tag details:", error);
      return null;
    }
  };

  // Lấy thông tin tags cho các câu hỏi
  useEffect(() => {
    const fetchUsersAndTags = async () => {
      const tagMap = {};
      if (Array.isArray(questions)) {
        for (let question of questions) {
          if (question.tags) {
            for (let tagId of question.tags) {
              if (!tagMap[tagId]) {
                const tag = await getTagDetails(tagId);
                tagMap[tagId] = tag;
              }
            }
          }
        }
      }
      setTags(tagMap);
    };

    if (questions.length > 0) {
      fetchUsersAndTags();
    }
  }, [questions]);

  // Khi userId thay đổi, fetch lại câu hỏi
  useEffect(() => {
    if (user?.id) {
      fetchQuestions();
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
        {questions.map((vote, index) => (
          <div
            key={index}
            className="d-flex flex-row align-items-center border rounded p-3 mb-3"
            style={{
              backgroundColor: "#F2F5FF", // Màu xanh nhạt giống ảnh
              borderColor: "#d0e6f5", // Màu viền nhẹ để hài hòa với nền
            }}
            onClick={() => handleQuestionClick(vote._id)}
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
              <div className="question_title">{vote.title}</div>
              <div className="mt-2">
                {vote.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="tag-item"
                    style={{ fontSize: "14px" }}
                  >
                    {/* Render tên tag */}
                    {tag?.name}
                  </span>
                ))}
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
        ))}
      </div>
    </div>
  );
};

export default QuesVoteSubTab;
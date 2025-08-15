import React, { useEffect, useState } from 'react';
import QuestionBox from '../../components/UserQuestion/QuestionBox';
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

const QuestionHolder = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState({});
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionService.getQuestionsByUserId(user?.id);
      console.log('bbbj', response)
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

  const getTagDetails = async (tagId) => {
    try {
      const res = await TagService.getDetailsTag(tagId);
      return res.data;
    } catch (error) {
      console.error("Error fetching tag details:", error);
      return null;
    }
  };

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

  useEffect(() => {
    if (user?.id) {
      fetchQuestions();
    }
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleQuestionClick = (questionId) => {
    navigate(`/question-detail/${questionId}`);
  };

  const handleOnUpdate = (questionId) => {
    navigate(`/update-question/${questionId}`);
  };

  const handleToggleHidden = async (ques, currentStatus) => {


    if (!ques._id) {
      console.error("Question ID is missing");
      return;
    }
    try {
      if(ques.reportCount<=2)
      {
        const isConfirmed = window.confirm(
          `Are you sure you want to ${currentStatus ? 'hide' : 'show'} this question?`
        );
    
        if (!isConfirmed) return;
      const res = await QuestionService.toggleActiceQues(ques._id);
      console.log("Successfully toggled question status:", res.data);

      // Cập nhật lại trạng thái của câu hỏi trong state sau khi toggle thành công
      const updatedQuestions = questions.map((question) =>
        question._id === ques._id ? { ...question, active: !currentStatus } : question
      );
      setQuestions(updatedQuestions);}
      else {
        alert('This question was hidden by admin!')
      }
    } catch (error) {
      console.error("Failed to toggle question status:", error.response?.data || error.message);
    }
  };

  const handleDelete = async (quesId) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this question?`);

    if (!isConfirmed) return;

    if (!quesId) {
      console.error("Question ID is missing");
      return;
    }

    try {
      const res = await QuestionService.deleteQuestion(quesId);
      console.log("Successfully deleted question:", res.data);

      // Hiển thị thông báo xóa thành công
      alert("Question deleted successfully!");

      // Tải lại danh sách câu hỏi
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error.response?.data || error.message);

      // Hiển thị thông báo lỗi nếu có
      alert("Failed to delete question. Please try again.");
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      {questions.map((question) => (
        <div key={question._id} onClick={() => handleQuestionClick(question._id)}>
          <QuestionBox
            key={question._id}
            title={question.title}
            tags={question.tags ? question.tags.map(tagId => tags[tagId]?.name || "Unknown Tag") : []}
            date={new Date(question.updatedAt).toLocaleString()}
            views={question.view}
            answers={question.answerCount}
            likes={question.upVoteCount}
            onUpdate={() => handleOnUpdate(question._id)}
            isHidden={question.active}
            onHidden={() => handleToggleHidden(question, question.active)}
            onDelete={() => handleDelete(question._id)}
          />
        </div>
      ))}
    </div>
  );
};

export default QuestionHolder;

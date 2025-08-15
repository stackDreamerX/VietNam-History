import React, { useEffect, useState } from 'react';
import QuestionAnswerBox from '../../components/AnswerBox/AnswerBox';
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import * as AnswerService from "../../services/AnswerService";

const AnswerSubTab = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState({});
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const fetchAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AnswerService.getAnswersByUserId(user?.id);
      if (response.status === 'OK') {
        console.log("RES", response);
        
        // Lấy thông tin câu hỏi cho mỗi câu trả lời
        const answersWithQuestions = await Promise.all(
          response.data.map(async (answer) => {
            const questionResponse = await QuestionService.getDetailsQuestion(answer.question);
            if (questionResponse.status === 'OK') {
              answer.question = questionResponse.data; // Gắn thông tin câu hỏi vào câu trả lời
            } else {
              console.error(`Failed to fetch question for answer ID: ${answer._id}`);
            }
            return answer;
          })
        );
        
        // Gán answers với thông tin câu hỏi vào state
        setAnswers(answersWithQuestions);
       
      } else {
        setError('Không thể tải câu trả lời');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải câu trả lời');
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
  
    const fetchTags = async () => {
      const tagMap = {};
      for (let answer of answers) {
      if(answer.question){
        if (answer.question.tags) {
          for (let tagId of answer.question.tags) {
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

    if (answers.length > 0) {
      fetchTags();
    }
  }, [answers]);

  useEffect(() => {
    if (user?.id) {
      fetchAnswers();
    }
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDelete = async (ansId) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this answer?`);
    if (!isConfirmed) return;

    try {
      await AnswerService.deleteAnswer(ansId);
      alert("Answer deleted successfully!");
      setAnswers((prev) => prev.filter((answer) => answer._id !== ansId));
    } catch (error) {
      console.error("Failed to delete answer:", error.response?.data || error.message);
      alert("Failed to delete answer. Please try again.");
    }
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/question-detail/${questionId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
       <div className="title">
       <h3>Answers {answers.filter(answer => answer.question).length}</h3>
      </div>
    
      {answers.map((answer) => {
        // Kiểm tra nếu answer.question là undefined thì không render
        if (!answer.question) return null;

        return (
          
          <QuestionAnswerBox
            onClick={()=>handleQuestionClick(answer.question._id)}
            key={answer._id}
            questionTitle={answer.question?.title || "Unknown Question"}
            questionTags={answer.question?.tags ? answer.question.tags.map(tagId=> tags[tagId]?.name || "Unknown Tag") : []}
            questionDate={new Date(answer.question?.createdAt).toLocaleString()}
            answerContent={answer.content}
            answerDate={new Date(answer.updatedAt).toLocaleString()}
            views={answer.question?.view || 0}
            answers={answer.question?.answerCount || 0}
            likes={answer.question?.upVoteCount || 0}
            onDeleteAnswer={() => handleDelete(answer._id)}
            isHiddenQuestion={answer.question?.active}
          />
          
        );
      })}
    </div>
  );
};

export default AnswerSubTab;

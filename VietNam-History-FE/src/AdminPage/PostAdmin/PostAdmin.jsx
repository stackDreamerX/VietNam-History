import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import QuestionBoxAdmin from '../../components/QuestionBoxAdmin/QuestionBoxAdmin';
import QuestionFilter from '../../components/QuestionFilter/QuestionFilter';
import SortBtnAdmin from '../../components/SortBtnAdmin/SortBtnAdmin';
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import * as UserService from "../../services/UserService";
import * as QuizService from "../../services/QuizService";
import { Modal, Select, Button } from 'antd';

const QuestionAdmin = () => {

  // Danh sách câu hỏi để filter
    const [filters, setFilters] = useState({
      no_answers: false,
      no_accepted_answer: false,
      tag: "",
      sort_by: "", // Lưu giá trị của "Sorted by"
      the_following_tags: false,
    });

  const [users, setUsers] = useState({});
  const [tags, setTags] = useState({});
  const [questions, setQuestions] = useState([]);
  const [filterOption, setFilterOption] = useState(null); // "New" hoặc "Popular"
  const [isLinkQuizModalVisible, setIsLinkQuizModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const navigate = useNavigate();

  const getAllQues = async () => {
    const res = await QuestionService.getAllQues();
    return res.data;
  };

  const {
    isLoading: isLoadingQues,
    data: fetchedQuestions,
    error,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: getAllQues,
  });

  const handleApplyFilters = (updatedFilters) => {
    console.log("Filters nhận được từ QuestionFilter:", updatedFilters);
    // Kiểm tra các trường hợp dữ liệu trống hoặc không hợp lệ

    if (!updatedFilters || typeof updatedFilters !== "object") {
      console.error("Filters không hợp lệ:", updatedFilters);
      return;
    }

    const safeFilters = {
      ...updatedFilters,
    };

    console.log("Filters đã áp dụng:", safeFilters);
    setFilters(safeFilters); // Cập nhật state với bộ lọc an toàn
  };

  const getFilteredQuestion = () => {
    let filteredQuestions = questions;

    // Sắp xếp theo "New" hoặc "Active"
    if (filterOption === "Newest") {
      filteredQuestions = filteredQuestions.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } else if (filterOption === "Reported") {
      filteredQuestions = filteredQuestions.sort(
        (a, b) => b.reportCount - a.reportCount
      );
    } else if (filterOption === "Unanswered") {
      filteredQuestions = filteredQuestions.filter(
        (question) => question.answerCount === 0
      ); // Chỉ hiển thị câu hỏi chưa có câu trả lời
    }

    // Lọc theo các filter
    if (filters.no_answers) {
      filteredQuestions = filteredQuestions.filter((q) => q.answerCount === 0);
    }

    if (filters.no_accepted_answer) {
      filteredQuestions = filteredQuestions.filter((q) => !q.acceptedAnswer);
    }

    if (filters.sort_by) {
      if (filters.sort_by === "newest") {
        filteredQuestions = filteredQuestions.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      } else if (filters.sort_by === "recent_activity") {
        filteredQuestions = filteredQuestions.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      } else if (filters.sort_by === "highest_score") {
        filteredQuestions = filteredQuestions.sort(
          (a, b) => b.upVoteCount - a.upVoteCount
        );
      } else if (filters.sort_by === "most_frequent") {
        filteredQuestions = filteredQuestions.sort(
          (a, b) => b.answerCount - a.answerCount
        );
      }
    }

    // Lọc theo tag
    if (filters.tag) {
      const searchTag = filters.tag?.trim().toLowerCase(); // Đảm bảo filters.tag hợp lệ
      filteredQuestions = filteredQuestions.filter((q) =>
        q.tags?.some((t) => {
          const tagName = tags[t]?.name || ""; // Giá trị mặc định
          return tagName.toLowerCase() === searchTag;
        })
      );
    }

    return filteredQuestions;
  };

  const getUserDetails = async (userId) => {
    if (!userId) return null;
    const res = await UserService.getDetailsUser(userId);
    return res.data;
  };

  const getTagDetails = async (tagId) => {
    const res = await TagService.getDetailsTag(tagId);
    return res.data;
  };

  // Fetch available quizzes
  const fetchAvailableQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await QuizService.getAllQuizzes(1, 100); // Get up to 100 quizzes
      if (response && response.data && response.data.quizzes) {
        // Make sure we have all necessary quiz data
        const quizzes = response.data.quizzes.map(quiz => ({
          _id: quiz._id,
          title: quiz.title || 'Untitled Quiz',
          description: quiz.description || '',
          // Include other fields if needed
        }));
        setAvailableQuizzes(quizzes);
        return quizzes;
      }
      return [];
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      return [];
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Handle link quiz button click
  const handleLinkQuiz = (question) => {
    setSelectedQuestion(question);
    setIsLinkQuizModalVisible(true);
    setLoadingQuizzes(true);

    // Fetch available quizzes
    fetchAvailableQuizzes().then(() => {
      // Set initially selected quizzes if the question already has linked quizzes
      if (question.linkedQuizzes && question.linkedQuizzes.length > 0) {
        // If linkedQuizzes are objects with _id property, extract the IDs
        const linkedQuizIds = question.linkedQuizzes.map(quiz =>
          typeof quiz === 'object' && quiz._id ? quiz._id : quiz
        );
        setSelectedQuizzes(linkedQuizIds);
      } else {
        setSelectedQuizzes([]);
      }
      setLoadingQuizzes(false);
    }).catch(error => {
      console.error("Error loading quizzes:", error);
      setLoadingQuizzes(false);
    });
  };

  // Handle save quiz links
  const handleSaveQuizLinks = async () => {
    if (!selectedQuestion) return;

    try {
      // Update the question with selected quiz IDs
      await QuestionService.updateQuestion(selectedQuestion._id, {
        linkedQuizzes: selectedQuizzes
      });

      // Get the full quiz objects for the selected IDs
      const selectedQuizObjects = availableQuizzes.filter(quiz =>
        selectedQuizzes.includes(quiz._id)
      );

      // Update local state with the full quiz objects
      const updatedQuestions = questions.map(q =>
        q._id === selectedQuestion._id
          ? { ...q, linkedQuizzes: selectedQuizObjects }
          : q
      );
      setQuestions(updatedQuestions);

      // Close modal
      setIsLinkQuizModalVisible(false);
      alert("Quiz links updated successfully!");
    } catch (error) {
      console.error("Error updating question with linked quizzes:", error);
      alert("Failed to update quiz links.");
    }
  };

  useEffect(() => {
    const fetchUsersAndTags = async () => {
      const userMap = {};
      const tagMap = {};

      if (Array.isArray(fetchedQuestions)) {
        for (let question of fetchedQuestions) {
          if (question.userQues) {
            const user = await getUserDetails(question.userQues);
            userMap[question.userQues] = user;
          }
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
      setUsers(userMap);
      setTags(tagMap);
      setQuestions(fetchedQuestions);
    };

    if (fetchedQuestions) {
      fetchUsersAndTags();
    }
  }, [fetchedQuestions]);

  if (isLoadingQues) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading questions: {error.message}</div>;
  }

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters({
      ...filters,
      [name]: checked,
    });
  };

  const handleQuestionClick = async (questionId) => {
    try {
      // Navigate to the admin question detail page without updating view count
      // This uses the direct navigation without calling updateViewCount
      navigate(`/admin/question-detail/${questionId}`);
    } catch (error) {
      console.error("Error navigating to question:", error);
      // Still try to navigate even if there's an error
      navigate(`/admin/question-detail/${questionId}`);
    }
  };

  const handleOnDelete = async (quesId, event) => {
    event.stopPropagation(); // Ngừng sự kiện lan truyền

    const isConfirmed = window.confirm("Are you sure you want to delete this question?");
    if (isConfirmed) {
      try {
        await QuestionService.deleteQuestion(quesId);
        setQuestions(questions.filter(question => question._id !== quesId));
        alert("Question deleted successfully!");
        navigate(-1);
      } catch (error) {
        console.error("Error deleting question: ", error);
        alert("Error deleting question.");
      }
    }
  };


  const handleToggleHidden = async (ques, currentStatus) => {
    if (!ques._id) {
      console.error("Question ID is missing");
      return;
    }
    try {
      const isConfirmed = window.confirm(
        `Are you sure you want to ${currentStatus ? "hide" : "show"} this question?`
      );
      if (!isConfirmed) return;

      // Xác định giá trị count cần cập nhật
      const updatedCount = currentStatus ? 3 : 0;

      // Gọi service để cập nhật count
      const res = await QuestionService.updateReportCount(ques._id, { count: updatedCount });
      await QuestionService.toggleActiceQues(ques._id)
      console.log("Successfully toggled question status:", res.data);

      // Cập nhật lại trạng thái của câu hỏi trong state sau khi toggle thành công
      const updatedQuestions = questions.map((question) =>
        question._id === ques._id
          ? { ...question, active: !currentStatus }
          : question
      );
      setQuestions(updatedQuestions);
      window.location.reload()
    } catch (error) {
      console.error("Failed to toggle question status:", error.response?.data || error.message);
    }
  };



  return (
    <div className="container">
      <h1 className='title'>MANAGEMENT QUESTIONS</h1>
      <p style={{ color: "#323538", marginTop: "10px", marginLeft: "20px", fontSize: "20px", fontWeight: "600" }}>
        {questions.length} questions
      </p>
      <br />
      <SortBtnAdmin setFilterOption={setFilterOption}/>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>
        <QuestionFilter onApplyFilters={handleApplyFilters} />
      </div>
      {/* Render các câu hỏi */}
      <div style={{ marginTop: "20px" }}>
        {isLoadingQues ? (
          <LoadingComponent isLoading={isLoadingQues} />
        ) :
          Array.isArray(questions) && questions.length > 0 ? (
            getFilteredQuestion().map((question) => {
              const user = users[question.userQues];
              return (
                <div
                  key={question._id}
                  onClick={() => handleQuestionClick(question._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <QuestionBoxAdmin
                    img={user?.img || ""}
                    username={user?.name || "Unknown"}
                    report={question?.reportCount || 0}
                    followers={user?.followerCount || 0}
                    title={question.title}
                    tags={question.tags ? question.tags.map(tagId => tags[tagId]?.name || tagId) : []}
                    date={new Date(question.updatedAt).toLocaleString()}
                    views={question.view}
                    answers={question.answerCount}
                    likes={question.upVoteCount}
                    isHidden={question.active}
                    onHidden={(e) => {
                      e.stopPropagation(); // Prevent triggering parent onClick
                      handleToggleHidden(question, question.active);
                    }}
                    onDelete={(event) => {
                      event.stopPropagation(); // Prevent triggering parent onClick
                      handleOnDelete(question._id, event);
                    }}
                    onLinkQuiz={(e) => {
                      e.stopPropagation(); // Prevent triggering parent onClick
                      handleLinkQuiz(question);
                    }}
                  />
                </div>
              );
            })
          ) : (
            <LoadingComponent isLoading={isLoadingQues} />
          )}
      </div>

      {/* Modal for linking quizzes to a question */}
      <Modal
        title="Link Quizzes to Question"
        open={isLinkQuizModalVisible}
        onCancel={() => setIsLinkQuizModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLinkQuizModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveQuizLinks}
            loading={loadingQuizzes}
          >
            Save
          </Button>
        ]}
        width={600}
      >
        {selectedQuestion && (
          <div>
            <h4>{selectedQuestion.title}</h4>
            <p>Select quizzes to link to this question:</p>

            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select quizzes"
              value={selectedQuizzes}
              onChange={setSelectedQuizzes}
              optionFilterProp="children"
              loading={loadingQuizzes}
              allowClear
              optionLabelProp="label"
            >
              {availableQuizzes.map(quiz => (
                <Select.Option
                  key={quiz._id}
                  value={quiz._id}
                  label={quiz.title}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{quiz.title}</div>
                    {quiz.description && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {quiz.description.length > 50
                          ? `${quiz.description.substring(0, 50)}...`
                          : quiz.description}
                      </div>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>

            {selectedQuizzes.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h5>Selected Quizzes:</h5>
                <ul>
                  {selectedQuizzes.map(quizId => {
                    const quiz = availableQuizzes.find(q => q._id === quizId);
                    return quiz ? (
                      <li key={quizId}>{quiz.title}</li>
                    ) : (
                      <li key={quizId}>Loading quiz information...</li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestionAdmin;

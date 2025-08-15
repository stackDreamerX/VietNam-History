import { useQuery } from "@tanstack/react-query";
import "../../../src/css/QuestionPage.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import QuestionFilter from "../../components/QuestionFilter/QuestionFilter";
import SortBtn from "../../components/SortBtn/SortBtn";
import { setAllSaved } from "../../redux/slides/savedSlide";
import * as QuestionReportService from "../../services/QuestionReportService";
import * as QuestionService from "../../services/QuestionService";
import * as SavedService from "../../services/SavedService";
import * as TagService from "../../services/TagService";
import * as UserService from "../../services/UserService";
import { createSaved } from "../../services/SavedService";
import Pagination from "../../components/Pagination/Pagination";

const QuestionPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  // Check if the user is an admin
  const admin = useSelector((state) => state.admin);
  const isAdmin = admin?.isAdmin === true;

  // console.log("user1", user);
  const [savedList, setSavedList] = useState([]); // Danh sách câu hỏi đã lưu
  const [reportedList, setReportedList] = useState([]); // Quản lý danh sách câu hỏi đã report
  const [questionList, setQuestionList] = useState([]); // Danh sách câu hỏi
  const [likeCounts, setLikeCounts] = useState({}); // Lưu số lượt like của mỗi câu hỏi
  const [filterOption, setFilterOption] = useState(null); // "New" hoặc "Popular"
  //Phan trang
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10; // Số câu hỏi mỗi trang
  const [totalQuestions, setTotalQuestions] = useState(0);
  // console.log("user", user);
  // Lấy `allSaved` từ Redux state
  const allSaved = useSelector((state) => state.saved.allSaved);

  const navigate = useNavigate();

  // Danh sách câu hỏi để filter
  const [filters, setFilters] = useState({
    no_answers: false,
    no_accepted_answer: false,
    tag: "",
    sort_by: "", // Lưu giá trị của "Sorted by"
    the_following_tags: false,
  });

  //const [userInfo, setUserInfo] = useState({});
  const [users, setUsers] = useState({});
  const [tags, setTags] = useState({});

  // Lấy danh sách câu hỏi từ API, bao gồm các tham số phân trang
  const getAllQuesByActive = async (page, limit) => {
    const res = await QuestionService.getAllQuestionByActive(true, page, limit);
    setTotalQuestions(res.total); // Cập nhật tổng số câu hỏi
    return res.data;
  };
  const {
    isLoading: isLoadingQues,
    data: questions,
    error,
  } = useQuery({
    queryKey: ["questions", currentPage], // Thêm currentPage vào queryKey để phản ánh tham số phân trang
    queryFn: () => getAllQuesByActive(currentPage, questionsPerPage),
  });

  // Lấy thông tin người dùng dựa trên userId từ câu hỏi
  const getUserDetails = async (userId) => {
    if (!userId) return null;
    const res = await UserService.getDetailsUser(userId);
    return res.data;
  };

  // Lấy thông tin tag dựa trên tagId
  const getTagDetails = async (tagId) => {
    const res = await TagService.getDetailsTag(tagId);
    console.log("res.data", res.data);
    return res.data;
  };

  useEffect(() => {
    const fetchUsersAndTags = async () => {
      const userMap = {};
      const tagMap = {};

      if (Array.isArray(questions)) {
        for (let question of questions) {
          // Lấy thông tin người dùng từ userId
          if (question.userQues) {
            const user = await getUserDetails(question.userQues);
            userMap[question.userQues] = user;
          }

          // Lấy thông tin tag từ tagId
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
    };

    if (questions) {
      fetchUsersAndTags();
    }
  }, [questions]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("allSaved")) || [];
    setSavedList(savedData.map((item) => item.question));
    dispatch(setAllSaved(savedData));
  }, [dispatch]);

  //hiện câu hỏi đã report
  useEffect(() => {
    // Lấy danh sách các câu hỏi đã được báo cáo từ localStorage
    const reported =
      JSON.parse(localStorage.getItem("reportedQuestions")) || [];
    setReportedList(reported);

    // Nếu `questions` đã được tải từ API, cập nhật trạng thái `isReported`
    setQuestionList((prevQuestions) =>
      prevQuestions.map((q) => ({
        ...q,
        isReported: reported.includes(q._id),
      }))
    );
  }, []);

  if (isLoadingQues) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading questions: {error.message}</div>;
  }

  const handleAskQuestionClick = () => {
    // Check if user is regular user or admin
    if (!user?.id && !isAdmin) {
      alert("Please log in to ask question!");
      navigate("/login", { state: location?.pathname });
    } else if (user?.id && !user?.active) {
      alert(
        "Your account is inactive. You cannot add a question at this time."
      );
    } else {
      // Allow both regular users and admins to ask questions
      navigate("/askquestion");
    }
  };

  const handleQuestionClick = async (questionId) => {
    try {
      if (!user?.id && !isAdmin) {
        console.error("User ID is missing and not an admin");
        return;
      }

      if (isAdmin) {
        // For admin users, just navigate directly without updating view count
        navigate(`/question-detail/${questionId}`);
      } else {
        // For regular users, update view count before navigation
        await QuestionService.updateViewCount(questionId, user.id);
        navigate(`/question-detail/${questionId}`);
      }
    } catch (error) {
      console.error(
        "Failed to update view count:",
        error.response?.data || error.message
      );

      // Still navigate to question detail even if view count update fails
      navigate(`/question-detail/${questionId}`);
    }
  };

  //xử lí like

  const handleSaved = async (questionId, userQues) => {
    // e.stopPropagation();
    try {
      if (savedList.includes(questionId)) {
        alert("Question already saved");
        return;
      }

      const savedResponse = await SavedService.createSaved({
        question: questionId,
        user: userQues,
      });

      console.log("Saved response:", savedResponse);

      setSavedList((prev) => [...prev, questionId]);

      // Lưu vào Redux (nếu cần)
      const updatedSavedList = [...allSaved, savedResponse.data]; // allSaved là state hiện tại
      dispatch(setAllSaved(updatedSavedList));
    } catch (error) {
      alert("Error saving question:", error);
    }
  };

  const handleUnsave = async (savedId) => {
    try {
      await SavedService.deleteSaved(savedId); // API xóa bài đã lưu

      const updatedSavedList = allSaved.filter(
        (saved) => saved._id !== savedId
      );

      // Cập nhật Redux và localStorage
      dispatch(setAllSaved(updatedSavedList));
      localStorage.setItem("allSaved", JSON.stringify(updatedSavedList));
    } catch (error) {
      console.error("Error unsaving question:", error);
    }
  };

  const handleReport = async (questionId) => {
    try {
      if (!user?.id) {
        console.error("User must be logged in to report questions.");
        return;
      }

      const isConfirmed = window.confirm(
        "Are you sure you want to report this question?"
      );

      if (!isConfirmed) {
        return; // Nếu người dùng nhấn "Cancel", thoát khỏi hàm
      }

      const response = await QuestionReportService.createQuestionReport({
        question: questionId,
        user: user.id, // ID người dùng
      });

      // Lấy danh sách đã báo cáo từ localStorage và cập nhật
      const updatedReported = [...reportedList, questionId];
      localStorage.setItem(
        "reportedQuestions",
        JSON.stringify(updatedReported)
      );

      setReportedList(updatedReported); // Cập nhật danh sách báo cáo trong state
      setQuestionList((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === questionId ? { ...q, isReported: true } : q
        )
      );
      console.log("Report submitted successfully:", response);
      alert(response.message); // Thông báo sau khi báo cáo thành công hoặc lỗi
    } catch (error) {
      console.error("Error reporting question:", error);
      alert("An error occurred while reporting the question.");
    }
  };

  const handleNavToSavedPage = () => {
    navigate("/saved-list");
  };

  // Hàm xử lý khi một checkbox thay đổi
  const handleCheckboxChanges = ({ name, checked }) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: name === "tag" ? checked || "" : checked, // Xử lý riêng với tag
    }));
  };

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

  // Hàm để thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoadingQues) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading questions: {error.message}</div>;
  }

  //Sort theo filter
  const getFilteredQuestion = () => {
    let filteredQuestions = questions;

    // Sắp xếp theo "New" hoặc "Active"
    if (filterOption === "Newest") {
      filteredQuestions = filteredQuestions.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } else if (filterOption === "Active") {
      filteredQuestions = filteredQuestions.sort(
        (a, b) => b.answerCount - a.answerCount
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

  return (
    <div className="container">
      <div
        style={{
          color: "#000000",
          marginTop: "20px",
          marginLeft: "20px",
          height: "auto",
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            All post
          </h1>
          <div className="btn-holder">
            <div className="askQues">
              <ButtonComponent
                textButton="Add a post"
                onClick={handleAskQuestionClick}
              />
            </div>

            <ButtonComponent
              textButton="Saved posts"
              onClick={handleNavToSavedPage}
            />
          </div>
        </div>
        <p
          style={{
            color: "#323538",
            marginTop: "10px",
            marginLeft: "20px",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          {questions.length} posts
        </p>
        <br />
        <SortBtn setFilterOption={setFilterOption} />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            width: "100%",
          }}
        >
          <QuestionFilter onApplyFilters={handleApplyFilters} />
        </div>
        {/* Render các câu hỏi */}
        <div style={{ marginTop: "20px" }}>
          {isLoadingQues ? (
            <LoadingComponent isLoading={isLoadingQues} />
          ) : Array.isArray(questions) && questions.length > 0 ? (
            getFilteredQuestion().map((question) => {
              console.log("question", question);
              console.log(
                "Questions length:",
                Array.isArray(questions) ? questions.length : "Not an array"
              );

              const user = users[question.userQues]; // Lấy thông tin người dùng từ state
              // console.log("tags", tags);
              // console.log("question.tags", question.tags);
              // console.log(
              //   "question.tags.map((tagId) => tags[tagId]?.name || tagId)",
              //   question.tags.map((tagId) => tags[tagId]?.name || tagId)
              // );
              return (
                <div
                  key={question._id}
                  onClick={() => handleQuestionClick(question._id)}
                >
                  <QuestionBox
                    id={question._id}
                    userQues={question.userQues}
                    img={user?.img || ""}
                    username={user?.name || "Unknown"}
                    reputation={user?.reputation || 0}
                    followerCount={user?.followerCount || 0}
                    title={question.title}
                    // tags={
                    //   question.tags
                    //     ? question.tags.map(
                    //       (tagId) => tags[tagId]?.name || tagId
                    //     )
                    //     : []
                    // } // Lấy tên tag từ tags map
                    tags={
                      question.tags
                        ? question.tags.map(
                            (tagId) => tags[tagId]?.name || tagId
                          )
                        : []
                    } // Lấy tên tag từ tags map
                    date={new Date(question.updatedAt).toLocaleString()}
                    views={question.view}
                    answers={question.answerCount}
                    likes={question.upVoteCount}
                    isLiked={savedList.includes(question._id)}
                    isSaved={allSaved.some(
                      (saved) => saved.question === question._id
                    )}
                    isReported={reportedList.includes(question._id)}
                    // onLike={(e) =>
                    //   handleSaved(e, question._id, question.userQues)
                    // }
                    onSave={() => handleSaved(question._id, question.userQues)}
                    onUnsave={() => {
                      const savedItem = allSaved.find(
                        (saved) => saved.question === question._id
                      );
                      if (savedItem) handleUnsave(savedItem._id); // Truyền `_id` của bài đã lưu
                    }}
                    onReport={() => handleReport(question._id)}
                    onClick={handleQuestionClick}
                  />
                </div>
              );
            })
          ) : (
            <LoadingComponent isLoading={isLoadingQues} />
          )}
        </div>
        {/* Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalQuestions / questionsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default QuestionPage;

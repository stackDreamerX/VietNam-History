import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import slider1 from "../../assets/image/slider1.webp";
import slider2 from "../../assets/image/slider2.webp";
import slider3 from "../../assets/image/slider3.webp";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import SortBtnHome from "../../components/SortBtnHome/SortBtnHome";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import * as QuestionService from "../../services/QuestionService";
import * as UserService from "../../services/UserService";
import { useQuery } from "@tanstack/react-query";
import * as TagService from "../../services/TagService";
import { useDispatch, useSelector } from "react-redux";
import * as SavedService from "../../services/SavedService";
import * as QuestionReportService from "../../services/QuestionReportService";
import { setAllSaved } from "../../redux/slides/savedSlide";

function HomePage() {
  /////////------xét login---------///////////////
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("interesting");
  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  //const [userInfo, setUserInfo] = useState({});
  const [users, setUsers] = useState({});
  const [tags, setTags] = useState({});

  const dispatch = useDispatch();

  console.log("user1", user);
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

  // Lấy danh sách câu hỏi từ API
  const getAllQuesByActive = async () => {
    const res = await QuestionService.getAllQuestionByActive(true); // Truyền active = true
    return res.data;
  };

  const {
    isLoading: isLoadingQues,
    data: questions,
    error,
  } = useQuery({
    queryKey: ["questions", true], // Thêm true vào queryKey để phản ánh tham số
    queryFn: getAllQuesByActive,
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

  if (isLoadingQues) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading questions: {error.message}</div>;
  }

  const handleAskQuestionClick = () => {
    if (!user?.id) {
      alert("Please log in to ask question!");
      navigate("/login", { state: location?.pathname });
    } else if (!user?.active) {
      alert(
        "Your account is inactive. You cannot add a question at this time."
      );
    } else {
      navigate("/askquestion");
    }
  };

  const handleQuestionClick = async (questionId) => {
    try {
      if (!user?.id) {
        console.error("User ID is missing");
        return;
      }
      await QuestionService.updateViewCount(questionId, user.id);

      navigate(`/question-detail/${questionId}`);
    } catch (error) {
      console.error(
        "Failed to update view count:",
        error.response?.data || error.message
      );
    }
  };

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

  return (
    <div className="container mt-4">

      <div className="row">
        <div className="col">
          <span className="title">TOP POST MAY INTEREST YOU</span>
        </div>
        <div className="col-auto" style={{ marginTop: "10px" }}>
          <ButtonComponent
            textButton="Add post"
            onClick={handleAskQuestionClick}
          />
        </div>
      </div>
      {/* <SortBtnHome></SortBtnHome> */}
      <div className="row mt-4">
        <div className="col-12">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((question) => {
              const user = users[question.userQues]; // Lấy thông tin người dùng từ state
              return (
                <div
                  key={question._id}
                  onClick={() => handleQuestionClick(question._id)}
                >
                  <QuestionBox
                    img={user?.img || ""}
                    username={user?.name || "Unknown"}
                    reputation={user?.reputation || 0}
                    followers={user?.followerCount || 0}
                    title={question.title}
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
                  />
                </div>
              );
            })
          ) : (
            <LoadingComponent isLoading={isLoadingQues} />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

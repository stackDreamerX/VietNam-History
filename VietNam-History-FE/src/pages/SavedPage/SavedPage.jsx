import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAllSaved } from "../../redux/slides/savedSlide";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import * as UserService from "../../services/UserService";
import * as QuestionService from "../../services/QuestionService";
import * as SavedService from "../../services/SavedService";
import * as TagService from "../../services/TagService";
import { useNavigate } from "react-router-dom";

const SavedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allSaved = useSelector((state) => state.saved.allSaved);
  // console.log("allSaved", allSaved);
  const user = useSelector((state) => state.user);
  const [enrichedSavedData, setEnrichedSavedData] = useState([]);

  // Hàm lấy thông tin người dùng
  const getUserDetails = async (userId) => {
    if (!userId) return null;
    const res = await UserService.getDetailsUser(userId);
    return res.data;
  };

  // Hàm lấy thông tin câu hỏi
  const getQuestionDetails = async (questionId) => {
    if (!questionId) return null;
    const res = await QuestionService.getDetailsQuestion(questionId);
    return res.data;
  };

  // Hàm kết hợp dữ liệu từ allSaved
  const fetchSavedDetails = async (savedList) => {
    const enrichedData = await Promise.all(
      savedList.map(async (saved) => {
        const user = await getUserDetails(saved.user); // Lấy thông tin người dùng
        const question = await getQuestionDetails(saved.question); // Lấy thông tin câu hỏi
        // console.log("questionssss", question);

        // Ánh xạ tagId sang tagName
        const tagsWithNames = await Promise.all(
          question.tags.map(async (tagId) => {
            const tagDetails = await getTagDetails(tagId); // Gọi API để lấy tagName
            return tagDetails.name; // Giả sử API trả về đối tượng { name: "TagName" }
          })
        );
        return {
          ...saved,
          user,
          question: {
            ...question,
            tags: tagsWithNames, // Thay đổi danh sách tags từ ID sang tên
          },
        };
      })
    );
    return enrichedData;
  };

  const getTagDetails = async (tagId) => {
    const res = await TagService.getDetailsTag(tagId);
    // console.log("res.data", res.data);
    return res.data;
  };

  // Hàm xử lý bỏ lưu câu hỏi (Unsave)
  const handleUnsave = async (savedId) => {
    try {
      // Gửi yêu cầu xóa bài lưu
      await SavedService.deleteSaved(savedId);

      // Cập nhật danh sách bài lưu trong Redux và local state
      const updatedSavedList = enrichedSavedData.filter(
        (saved) => saved._id !== savedId
      );
      setEnrichedSavedData(updatedSavedList);

      // Lưu vào Redux
      const savedIds = updatedSavedList.map((saved) => ({
        question: saved.question._id,
        user: saved.user._id,
      }));
      dispatch(setAllSaved(savedIds));

      // Đồng bộ với localStorage
      localStorage.setItem("allSaved", JSON.stringify(savedIds));
    } catch (error) {
      console.error("Error unsaving question:", error);
    }
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("allSaved")) || [];
    dispatch(setAllSaved(savedData)); // Đồng bộ từ localStorage

    const fetchData = async () => {
      const enrichedData = await fetchSavedDetails(savedData); // Lấy thông tin chi tiết
      setEnrichedSavedData(enrichedData);
    };

    fetchData();
  }, [dispatch]);

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

  return (
    <div className="container">
      <h1>Saved Questions</h1>
      {enrichedSavedData.length > 0 ? (
        enrichedSavedData.map((saved) => (
          <div
            key={allSaved.question}
            onClick={() => handleQuestionClick(saved.question._id)}
          >
            <QuestionBox
              key={saved._id}
              id={saved.question._id}
              img={saved.user.img}
              username={saved.user.name}
              reputation={saved.user.reputation}
              followerCount={saved.user.followerCount}
              title={saved.question.title}
              tags={saved.question.tags}
              date={new Date(saved.question.createdAt).toLocaleString()}
              views={saved.question.view}
              answers={saved.question.answerCount}
              likes={saved.question.upVoteCount}
              isSaved={true}
              onUnsave={() => handleUnsave(saved._id)} // Gọi handleUnsave
            />
          </div>
        ))
      ) : (
        <p>No saved questions yet.</p>
      )}
    </div>
  );
};

export default SavedPage;

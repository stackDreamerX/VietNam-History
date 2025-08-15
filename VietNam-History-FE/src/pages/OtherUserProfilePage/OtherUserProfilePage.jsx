import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import FormComponent from "../../components/FormComponent/FormComponent";
import QuestionBox from "../../components/UserQuestion/QuestionBox";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDetailsUser } from "../../services/UserService";
import { setDetailUser } from "../../redux/slides/userSlide";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";

function OtherUserProfilePage() {
  const { userId } = useParams(); // Lấy userId từ URL
  const dispatch = useDispatch();
  const { detailUser } = useSelector((state) => state.user); // Lấy chi tiết user từ Redux
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useSelector((state) => state.user);

  // Lấy dữ liệu người dùng từ API
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getDetailsUser(userId); // Gọi API để lấy thông tin chi tiết
        dispatch(setDetailUser(response.data)); // Lưu vào Redux
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, dispatch]);

  //////////////--------hiển thị câu hỏi---------/////////////
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState({});
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionService.getQuestionsByUserId(userId);
      console.log("bbbj", response);
      if (response.status === "OK") {
        setQuestions(response.data);
      } else {
        setError("Không thể tải câu hỏi");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải câu hỏi");
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
    if (userId) {
      fetchQuestions();
    }
  }, [userId]);

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

  const handleToggleHidden = async (quesId, currentStatus) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to ${
        currentStatus ? "hide" : "show"
      } this question?`
    );

    if (!isConfirmed) return;

    if (!quesId) {
      console.error("Question ID is missing");
      return;
    }

    try {
      const res = await QuestionService.toggleActiceQues(quesId);
      console.log("Successfully toggled question status:", res.data);

      // Cập nhật lại trạng thái của câu hỏi trong state sau khi toggle thành công
      const updatedQuestions = questions.map((question) =>
        question._id === quesId
          ? { ...question, active: !currentStatus }
          : question
      );
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error(
        "Failed to toggle question status:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <>
      <div className="container mt-4">
        {/* Avatar và Tên */}
        <div className="row">
          <div className="col-3">
            <img
              src={detailUser.img || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          </div>
          <div className="col-9">
            <div className="row">
              <h2 className="mt-3">{detailUser.name || "Anonymous User"}</h2>
            </div>
            <div className="row">
              <div className="col">
                <i className="bi bi-calendar"></i>
                <p>
                  Member since:{" "}
                  {new Date(detailUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-3">
            <h3 className="title-profile">Summary</h3>
            <div className="card-profile" style={{ padding: "0 10px" }}>
              <table className="table table-borderless">
                <tbody style={{ verticalAlign: "middle" }}>
                  <tr>
                    <td className="fw-bold fs-5">{detailUser.score || 0}</td>
                    <td className="fw-bold fs-5">
                      {detailUser.followerCount || 0}
                    </td>
                  </tr>
                  <tr className="row-2">
                    <td className="text-muted">Reputation</td>
                    <td className="text-muted">Followers</td>
                  </tr>
                  <tr>
                    <td className="fw-bold fs-5">
                      {detailUser.savedCount || 0}
                    </td>
                    <td className="fw-bold fs-5">
                      {detailUser.followingCount || 0}
                    </td>
                  </tr>
                  <tr className="row-2">
                    <td className="text-muted">Saved</td>
                    <td className="text-muted">Following</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-9">
            <div>
              <h3 className="title-profile">Profile</h3>
              <div className="card-profile " style={{ padding: "0 20px" }}>
                <div style={{ marginTop: "30px" }}>
                  <FormComponent
                    id="emailInput"
                    label="Address"
                    type="text"
                    value={detailUser.address || "No address provided"}
                    disabled
                  />
                  <FormComponent
                    id="birthdayInput"
                    label="Birthday"
                    type="date"
                    value={
                      detailUser.birthday &&
                      !isNaN(new Date(detailUser.birthday).getTime())
                        ? new Date(detailUser.birthday)
                            .toISOString()
                            .split("T")[0]
                        : "" // Trả về giá trị mặc định nếu ngày không hợp lệ
                    }
                    disabled
                  />

                  <FormComponent
                    id="noteInput"
                    label="About me"
                    type="text"
                    value={detailUser.note || "No introduction provided"}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="title-profile" style={{ marginTop: "30px" }}>
                Links
              </h3>
              <div className="card-profile " style={{ padding: "0 20px" }}>
                <div className="row">
                  <div className="col-6">
                    <FormComponent
                      id="facebookInput"
                      label="Facebook"
                      type="link"
                      value={detailUser.facebookLink || "No Facebook link"}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <FormComponent
                      id="githubInput"
                      label="Github"
                      type="link"
                      value={detailUser.githubLink || "No Github link"}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="title-profile" style={{ marginTop: "30px" }}>
                Questions
              </h3>
              <div className="card-profile " style={{ padding: "0 20px" }}>
                <div style={{ padding: "20px" }}>
                  {questions.map((question) => (
                    <div
                      key={question._id}
                      onClick={() => handleQuestionClick(question._id)}
                    >
                      <QuestionBox
                        key={question._id}
                        title={question.title}
                        tags={
                          question.tags
                            ? question.tags.map(
                                (tagId) => tags[tagId]?.name || "Unknown Tag"
                              )
                            : []
                        }
                        date={new Date(question.updatedAt).toLocaleString()}
                        views={question.view}
                        answers={question.answerCount}
                        likes={question.upVoteCount}
                        onUpdate={() => handleOnUpdate(question._id)}
                        isHidden={question.active}
                        onHidden={() =>
                          handleToggleHidden(question._id, question.active)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OtherUserProfilePage;

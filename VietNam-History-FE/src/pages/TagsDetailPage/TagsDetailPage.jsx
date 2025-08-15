import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionFilter from "../../components/QuestionFilter/QuestionFilter";
import SortBtn from "../../components/SortBtn/SortBtn";
import * as TagService from "../../services/TagService";
import * as QuestionService from "../../services/QuestionService";
import * as UserService from "../../services/UserService"; // Giả sử bạn có dịch vụ này để lấy thông tin người dùng
import { useQuery } from "@tanstack/react-query";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import { useSelector } from "react-redux";

const TagsDetailPage = () => {
    const { tagId } = useParams();
    const navigate = useNavigate();
    const [tagDetails, setTagDetails] = useState(null);
     const [filterOption, setFilterOption] = useState(null); // "New" hoặc "Popular"
    const [filters, setFilters] = useState({
        no_answers: false,
        no_accepted_answer: false,
        has_bounty: false,
        newest: false,
        recent_activity: false,
        highest_score: false,
        most_frequent: false,
        bounty_ending_soon: false,
        the_following_tags: false,
    });
    const [users, setUsers] = useState({});
    const [tags, setTags] = useState({});
    const user = useSelector((state)=>state.user)

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFilters({
            ...filters,
            [name]: checked,
        });
    };
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

    return filteredQuestions;
  };

    // Lấy thông tin tag
    useEffect(() => {
        const fetchTagDetails = async () => {
            try {
                const res = await TagService.getDetailsTag(tagId);
                setTagDetails(res.data);
                //setUsedCount (res.data.length), // Lưu dữ liệu vào state
            } catch (error) {
                console.error("Error fetching tag details:", error);
            }
        };

        if (tagId) fetchTagDetails();
    }, [tagId]);

    // Lấy danh sách câu hỏi theo tag
    const getAllQues = async (tagId) => {
        const res = await QuestionService.getAllQuesByTag(tagId);
        return res.data;
    };

    const { isLoading: isLoadingQues, data: questions } = useQuery({
        queryKey: ["questions", tagId],
        queryFn: () => getAllQues(tagId),
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

    // Xử lý trạng thái loading
    if (isLoadingQues || !tagDetails || !tags) {
        return <p>Loading...</p>;
    }

      const handleQuestionClick = async (questionId) => {
        try {
          if (!user?.id) {
            console.error("User ID is missing");
            return;
          }

          // Gọi API updateViewCount
          await QuestionService.updateViewCount(questionId, user.id);

          // Điều hướng sau khi gọi API thành công
          navigate(`/question-detail/${questionId}`);
        } catch (error) {
          console.error("Failed to update view count:", error.response?.data || error.message);
        }
      };

    return (
        <div
            className="container"
            style={{
                color: "#023E73",
                marginTop: "30px",
                marginBottom: "50px",
                backgroundColor: "#faf6ed",
                padding: "30px",
                borderRadius: "8px",
                boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
                border: "1px solid #e6dcc6"
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
                        marginTop: "20px",
                    }}
                >
                    [{tagDetails.name}]
                </h1>
            </div>
            <p style={{
                fontSize: "17px",
                lineHeight: "1.6",
                marginBottom: "35px",
                marginTop: "15px",
                padding: "15px 20px",
                backgroundColor: "#f5f1e6",
                borderLeft: "4px solid #b0a080",
                borderRadius: "0 4px 4px 0",
                color: "#5a4a2d",
                fontStyle: "italic",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <strong style={{ color: "#3f3424" }}>{tagDetails.name}:</strong> {tagDetails.description}
            </p>
            <div className="row" style={{ marginTop: "30px" }}>
                <div className="col">
                    <p style={{
                        fontSize: "22px",
                        color: "#5d4b35",
                        fontWeight: "600",
                        fontFamily: "Georgia, serif",
                        textShadow: "0 1px 1px rgba(255,255,255,0.8)"
                    }}>
                        {questions.length} Bài Post
                    </p>
                </div>
                <div className="col">
                    {/* SortBtn moved to center section below */}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                    marginBottom: "30px",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        padding: "12px 25px",
                        backgroundColor: "#f0e9db",
                        borderRadius: "6px",
                        border: "1px solid #d9ceb2",
                        display: "inline-block",
                    }}
                >
                    <SortBtn setFilterOption={setFilterOption} />
                </div>
            </div>
            <div style={{ marginTop: "20px" }}>
                {Array.isArray(questions) && questions.length > 0 ? (
                    getFilteredQuestion().map((question) => {
                        const user = users[question.userQues]; // Lấy thông tin người dùng từ state
                        return (
                            <div
                                key={question._id}
                                onClick={() => handleQuestionClick(question._id)}
                            >
                                <QuestionBox
                                    username={user?.name || "Unknown"}
                                    img={user?.img || ""}
                                    reputation={user?.reputation || 0}
                                    followers={user?.followerCount || 0}
                                    title={question.title}
                                    tags={question.tags ? question.tags.map(tagId => tags[tagId]?.name || tagId) : []} // Lấy tên tag từ tags map
                                    date={question.updatedAt}
                                    views={question.view}
                                    answers={question.answerCount}
                                    likes={question.upVoteCount}
                                />
                            </div>
                        );
                    })
                ) : (
                    <p>No questions available.</p>
                )}
            </div>
        </div>
    );
};

export default TagsDetailPage;

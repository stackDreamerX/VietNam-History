import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import Comment from "../../components/CommentDelete/CommentDelete"
import Compressor from "compressorjs";
import { useDispatch, useSelector } from "react-redux";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as message from "../../components/MessageComponent/MessageComponent";
import * as AnswerService from "../../services/AnswerService";
import * as UserService from "../../services/UserService";
import * as TagService from "../../services/TagService";
import * as QuestionService from "../../services/QuestionService";
import * as CommentService from "../../services/CommentService";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { addAnswer } from '../../redux/slides/AnswerSlice'; // Import action
import * as CommentReportService from "../../services/CommentReportService";
import {
  setDetailAsker,
  setDetailQuestion,
} from "../../redux/slides/questionSlide";
import { setDetailUser } from "../../redux/slides/userSlide";
import { setAllTag } from "../../redux/slides/tagSlide";
import AnswerEditor from "../../components/AnswerComponent/AnswerComponent"
import parse from 'html-react-parser';


const QuestionDetails = () => {
  const navigate = useNavigate();
  const [showTextArea, setShowTextArea] = useState(false);
  const [content, setContent] = useState("");
  const [userAns, setIdUser] = useState('');
  const [imageSrcs, setImageSrcs] = useState([]); // Chứa nhiều ảnh đã chọn
  const user = useSelector((state) => state.user);
  const [answers, setAnswers] = useState([]); // State để lưu trữ danh sách câu trả lời
  const [idQues, setIdQues] = useState("");
  const [userCom, setIdUserCom] = useState('');
  const [TextCom, setTextCom] = useState('');
  const [reportedCommentList, setReportedCommentList] = useState([]);
  // console.log("user", user)

  // const [userDetails, setUserDetails] = useState(null); // State lưu thông tin người hỏi

  // const question = useSelector((state) => state.question);
  const dispatch = useDispatch();
  const { questionId } = useParams(); // Lấy ID câu hỏi từ URL

  // Lấy dữ liệu chi tiết của câu hỏi từ Redux store
  const questionDetail = useSelector((state) => state.question.detailQuestion);
  console.log("Question Detail:", questionDetail);

  const detailAsker = useSelector((state) => state.question.detailAsker);
  console.log("detailAsker", detailAsker);

  const allTags = useSelector((state) => state.tag.allTag);
  console.log("allTags", allTags);

  const mutation = useMutationHook(data => AnswerService.addAns(data));
  const { data, isLoading, isSuccess, isError } = mutation;

  const mutationComment = useMutationHook(data => CommentService.addComment(data));
  const { dataCom, isLoadingCom, isSuccessCom, isErrorCom } = mutationComment;

  //lấy thông tin người hỏi
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (questionDetail?.data?.userQues) {
          const userDetails = await UserService.getDetailsUser(
            questionDetail.data.userQues
          );
          console.log("userDetails", userDetails);
          dispatch(setDetailAsker(userDetails)); // Lưu thông tin người hỏi vào Redux
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [dispatch, questionDetail?.data?.userQues]);

  //lấy thông tin câu hỏi
  useEffect(() => {
    // console.log("Question ID:", questionId);
    const fetchQuestionDetail = async () => {
      try {
        const data = await QuestionService.getDetailsQuestion(questionId); // Gọi API để lấy chi tiết câu hỏi
        console.log("Data Question:", data);
        dispatch(setDetailQuestion(data)); // Lưu dữ liệu vào Redux
      } catch (error) {
        console.error("Error fetching question detail:", error);
      }
    };

    fetchQuestionDetail();
  }, [dispatch, questionId]);

  //Lấy thông tin tag
  useEffect(() => {
    const fetchTagsDetails = async () => {
      if (questionDetail?.data?.tags?.length) {
        try {
          const tagDetails = await Promise.all(
            questionDetail.data.tags.map((tagId) =>
              TagService.getDetailsTag(tagId)
            )
          );
          dispatch(setAllTag(tagDetails));
        } catch (error) {
          console.error("Error fetching tag details:", error);
        }
      }
    };

    console.log("");
    fetchTagsDetails();
  }, [dispatch, questionDetail?.data?.tags]);

  // useEffect(() => {
  //   if (!questionDetail?.id) {
  //     // Điều hướng về trang trước nếu không có dữ liệu
  //     navigate("/question");
  //   }
  // }, [questionDetail.detailQuestion, navigate]);


  // Lấy danh sách câu trả lời
  const fetchAnswersWithUserDetails = async () => {
    try {
      const response = await AnswerService.getAnswersByQuestionIdAdmin(questionId);
      const answersWithUserDetails = await Promise.all(
        response.data.data.map(async (answer) => {
          const userName = await fetchUserDetails(answer.userAns);
          return { ...answer, userName };
        })
      );
      setAnswers(answersWithUserDetails); // Cập nhật danh sách câu trả lời với tên người dùng
    } catch (error) {
      console.error("Error fetching answers with user details:", error);
    }
  };

  // Gọi hàm này thay cho `fetchAnswers`
  useEffect(() => {
    fetchAnswersWithUserDetails();
  }, [questionId]);





  //useEffect lay thong tin user
  useEffect(() => {

    if (user?.id) {
      setIdUser(user.id);
    }
  }, [user]);

  // Nhận text comment
  const handleTextCom = (value) => {
    setTextCom(value);
  };

  // useEffect(() => {
  //   if (question?.id) {
  //     setIdQues(question.id);
  //   }
  // }, [question]);


  //useEffect them cau tra loi
  useEffect(() => {
    if (isSuccess && data?.status !== 'ERR') {
      message.success();
      alert('Answer has been added successfully!');
      fetchAnswersWithUserDetails(); // Cập nhật danh sách câu trả lời sau khi thêm
    }
    if (isError) {
      message.error();
    }
  }, [isSuccess, isError]);

  const mutationUpdate = useMutationHook(id => UserService.updateAnswerCount(id));
  const { data: dataUpdate, isLoading: isLoadingUpdate, isSuccess: isSuccessUpdate, isError: isErrorUpdate } = mutationUpdate;

  //useEffect cho update answerCount cua User
  useEffect(() => {
    if (isSuccessUpdate && dataUpdate?.status !== 'ERR') {
      message.success();
    }
    if (isErrorUpdate) {
      message.error();
    }
  }, [isSuccessUpdate, isErrorUpdate, dataUpdate]);
  //Click them answer
  const handlePostAnswerClick = useCallback(async () => {
    if (!user?.id) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    if (!content.trim()) {
      alert("Answer content cannot be empty.");
      return;
    }

    const answerData = {
      content: content.trim(),
      userAns: user.id,
      question: questionId,
      images: imageSrcs,
    };

    try {
      // Gửi API thêm câu trả lời
      const response = await mutation.mutateAsync(answerData);
      if (response?.status !== 'ERR') {
        // Reset nội dung và ảnh
        setContent("");
        setImageSrcs([]);

        // Cập nhật số câu trả lời cho câu hỏi (update answerCount)
        const updatedAnswerCount = questionDetail.data?.answerCount + 1; // Tăng 1 số câu trả lời
        await QuestionService.updateAnswerCount(questionId, updatedAnswerCount);
        //Cập nhật số câu trả lời của người dùng đã post
        await mutationUpdate.mutateAsync(userAns);
        // Gọi hàm fetchAnswers để cập nhật danh sách câu trả lời
        fetchAnswersWithUserDetails();

        // Hiển thị thông báo thành công
        message.success("Answer has been added successfully!");
      } else {
        throw new Error(response?.message || "Failed to add answer.");
      }
    } catch (error) {
      console.error("Error while posting answer:", error);
      message.error("An error occurred. Please try again.");
    }
  }, [content, imageSrcs, mutation, questionDetail.data?.answerCount, questionId, user, fetchAnswersWithUserDetails]);

  // console.log("COUNT", questionDetail.data)

  useEffect(() => {
    fetchAnswersWithUserDetails(); // Gọi hàm để lấy danh sách câu trả lời khi component mount
  }, [questionId]);




  //Ham thay thong tin user theo ID
  const fetchUserDetails = async (userId) => {
    try {
      const userDetails = await UserService.getDetailsUser(userId);
      return userDetails?.data?.name || "Unknown User"; // Lấy tên hoặc giá trị mặc định
    } catch (error) {
      console.error("Error fetching user details:", error);
      return "Unknown User"; // Giá trị fallback
    }
  };
  //Thay doi trang thai cau tra loi
  const handleToggleAnswerStatus = async (answerId, isActive) => {
    try {
      console.log("ANSWER", answerId)
      console.log("STATUS", isActive)
      const updatedAnswer = await AnswerService.updateAnswerStatus(answerId, !isActive);
      if (updatedAnswer?.status !== 'ERR') {
        message.success(`Answer has been ${isActive ? 'deleted' : 'restored'} successfully!`);
        console.log("STATUS", isActive)
        fetchAnswersWithUserDetails(); // Cập nhật danh sách câu trả lời
      } else {
        throw new Error(updatedAnswer?.message || "Failed to update answer status.");
      }
    } catch (error) {
      console.error("Error updating answer status:", error);
      message.error("An error occurred. Please try again.");
    }
  };

  //report comment
    const handleCommentReport = async (commentQuess) => {
      try {
        if (!user?.id) {
          console.error("User must be logged in to report comments.");
          return;
        }

        const isConfirmed = window.confirm(
          "Are you sure you want to report this comment?"
        );

        if (!isConfirmed) {
          return; // Nếu người dùng nhấn "Cancel", thoát khỏi hàm
        }

        const response = await CommentReportService.createCommentReport({
          comment: commentQuess._id, // ID của bình luận
          user: user.id, // ID của người dùng
        });

        // Cập nhật danh sách báo cáo
        const updatedList = [...reportedCommentList, commentQuess._id];
        setReportedCommentList(updatedList);
        localStorage.setItem("reportedComments", JSON.stringify(updatedList)); // Lưu vào localStorage

        console.log("Report submitted successfully:", response);

        // Cập nhật danh sách các bình luận đã báo cáo
        // setReportedCommentList((prev) => [...prev, commentQuess._id]);

        alert(response.message); // Thông báo sau khi báo cáo thành công
      } catch (error) {
        console.error("Error reporting comment:", error);
        alert("An error occurred while reporting the comment.");
      }
    };

  //load comment bị report
    useEffect(() => {
      // Lấy danh sách đã báo cáo từ localStorage
      const reported = JSON.parse(localStorage.getItem("reportedComments")) || [];
      setReportedCommentList(reported);
    }, []);



  useEffect(() => {
    if (isSuccessCom && dataCom?.status !== 'ERR') {
      message.success();
      alert('Comment has been added successfully!');
      navigate("/Comment")
    }
    if (isErrorCom) {
      message.error();
    }
  }, [isSuccessCom, isErrorCom]);

  //Lấy tất cả comment
  const getAllCom = async () => {
    const res = await CommentService.getAllComment(questionId);
    return res.data;
  };

  const {
    isLoading: isLoadingQues,
    data: commentQuess,
    error,
  } = useQuery({
    queryKey: ["commentQuess"],
    queryFn: getAllCom,
  });

  //Lấy tất cả comment của câu hỏi
     const getAllComAns = async () => {
      const res = await CommentService.getCommentByQuestionId(questionId);
      return res.data;
    };

    const {
      isLoading: isLoadingQuesAns,
      data: commentAns,
      error : errorCom,
    } = useQuery({
      queryKey: ["commentAns"],
      queryFn: getAllComAns,
    });



  //Xóa bình luận
  const deleteMutation = useMutationHook(data => CommentService.deleteComment(data));
  const { isSuccess: isSuccessDelete, isError: isErrorDelete } = deleteMutation;
  useEffect(() => {

    if ( isErrorDelete) {
        message.error();
    }
}, [ isSuccessDelete, isErrorDelete, ]);

const reloadPage = () => {
    window.location.reload();
  };

const handleDeleteComment = (comment,event) => {
    // Ngừng sự kiện lan truyền
    event.stopPropagation();
       const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
       if (isConfirmed) {
           deleteMutation.mutate(comment);
           alert("Question deleted successfully!");
       }
       reloadPage();
};



  return (
    <div className="container my-4">
      {/* Phần người đăng */}
      <div className="d-flex align-items-center mb-4">
        <img
          src={detailAsker.data?.img || "https://via.placeholder.com/50"}
          alt="User Avatar"
          className="rounded-circle me-3"
          style={{
            height: "50px",
            width: "50px",
            borderRadius: "50%",
          }}
        />
        <div>
          <strong>{detailAsker.data?.name || "Anonymous"}</strong>
          <p className="text-muted mb-0" style={{ fontSize: "0.9em" }}>
            Asked {questionDetail.data?.createdAt || "Unknown time"}
          </p>
        </div>
      </div>

      {/* Phần tiêu đề câu hỏi */}
      <div className="mb-4">
        <h3>{questionDetail.data?.title || "Question Title"}</h3>
        <p className="text-secondary">
          <span className="me-3">{questionDetail.data?.view} views</span>
          <span className="text-success me-3">
            +{questionDetail.data?.upVoteCount}
          </span>
          <span className="text-danger">
            -{questionDetail.data?.downVoteCount}
          </span>
        </p>
      </div>

      {/* Nội dung bài viết */}
      <div className="bg-light p-4 rounded mb-4">
        <div className="content-container" style={{
          backgroundColor: "#fffde7",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginBottom: "15px"
        }}>
          {parse(questionDetail.data?.content || "No content provided")}
        </div>
        <div className="bg-dark text-white p-3 rounded">
          {questionDetail.data?.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Question Image ${index}`}
              className="img-fluid rounded my-2"
            />
          ))}
        </div>
        <p className="mt-3">Output:</p>
        <div className="p-2 rounded" style={{
          backgroundColor: "#fffde7",
          border: "1px solid #e0e0e0",
          borderRadius: "8px"
        }}>
          <code>9 8 7 6 5 4 3 2 1 0</code>
        </div>
        <div className="mt-3" style={{
          backgroundColor: "#fffde7",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginTop: "15px"
        }}>
          {parse(questionDetail.data?.note || "")}
        </div>

        {/* Tags chủ đề */}
        <div className="mt-4">
          {questionDetail.tags?.map((tag, index) => (
            <span
              key={tag.id || tag._id || index}
              className="badge bg-primary me-2"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Phần bình luận */}
      <div className="mb-4">
        <h5 className="mb-3">Comments</h5>
        {Array.isArray(commentQuess) && commentQuess.length > 0 ? (
          commentQuess.map((commentQues) => {
            return (
              <div
                key={commentQues._id}
              >
                <Comment
                name={commentQues.user.name || "Unknown"}
                img={commentQues.user.img || "https://via.placeholder.com/40"}
                text={commentQues.content || "Unknown"}
                date={new Date(commentQues.createdAt).toLocaleString()}
                key={commentQues._id || commentQues.id || commentQues}
                onReport={() => handleCommentReport(commentQues)}
                isReported={reportedCommentList.includes(commentQues._id)}
                onclick1={(event)=> handleDeleteComment(commentQues._id,event)}
                />
              </div>
            );
          })
        ) : (
          <p>No comments available.</p>
        )}
      </div>


      {/* Danh sách câu trả lời */}
      <div>
        <h5 className="mb-3">{answers.length} Answers</h5>
        {Array.isArray(answers) && answers.length > 0 ? (
          answers.map((answer, index) => (
            <div key={index} className="p-3 border rounded mb-3">
              <div className="d-flex align-items-center mb-2">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Answerer Avatar"
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                />
                <div>
                </div>
                <div>
                  <strong>{answer.userName || "Loading..."}</strong>
                  <div className="div-warning-btn" style={{ display: 'flex' }}>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9em" }}>
                      Answered {new Date(answer.createdAt).toLocaleString()}
                    </p>
                    <div>
                      <button
                        style={{ marginLeft: 10 }}
                        className={`btn btn-sm ${answer.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleAnswerStatus(answer._id, answer.active)}
                      > {answer.active ? "Delete" : "Restore"}</button>

                    </div>
                  </div>
                </div>
              </div>
              <p>{parse(answer.content)}</p>
              {answer.images?.map((img, index) => (
                <img
                  src={img || "https://via.placeholder.com/150"}
                  alt={`Answer Image ${index}`}

                />
              ))}
              <div >
                <h5 className="mb-3"> Comments</h5>
        {Array.isArray(commentAns) && commentAns.length > 0 ? (
          commentAns.filter((commentQues) => commentQues.answer === answer._id) // Lọc các comment có answer = answer.id
          .map((commentQues) => {
            return (
              <Comment
                name={commentQues.user.name || "Unknown"}
                img={commentQues.user.img || "https://via.placeholder.com/40"}
                text={commentQues.content || "Unknown"}
                date={new Date(commentQues.createdAt).toLocaleString()}
                key={commentQues._id || commentQues.id || commentQues}
                onReport={() => handleCommentReport(commentQues)}
                isReported={reportedCommentList.includes(commentQues._id)}
                onclick1={(event)=> handleDeleteComment(commentQues._id,event)}
              />
            );
          })
          ) : (
          <p>No comments available.</p>
        )}
      </div>
            </div>
          ))
        ) : (
          <p>No answers available.</p>
        )}

      </div>
    </div>
  );
};

export default QuestionDetails;

import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import Comment from "../../components/Comment/CommentComponent";
import Comment2 from "../../components/CommentDelete/CommentDelete";
import Compressor from "compressorjs";
import { useDispatch, useSelector } from "react-redux";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as message from "../../components/MessageComponent/MessageComponent";
import * as AnswerService from "../../services/AnswerService";
import * as UserService from "../../services/UserService";
import * as TagService from "../../services/TagService";
import * as QuestionService from "../../services/QuestionService";
import * as QuestionVoteService from "../../services/QuestionVoteService";
import * as AnswerVoteService from "../../services/AnswerVoteService";
import * as CommentService from "../../services/CommentService";
import * as CommentReportService from "../../services/CommentReportService";
import * as AnswerReportService from "../../services/AnswerReportService";
import * as NotificationService from "../../services/NotificationService";
import LinkedQuizzes from "../../components/QuizComponent/LinkedQuizzes";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { setDetailAnswer, addAnswer } from "../../redux/slides/AnswerSlice"; // Import action
import {
  setDetailAsker,
  setDetailQuestion,
} from "../../redux/slides/questionSlide";
import { setDetailUser } from "../../redux/slides/userSlide";
import { setAllTag } from "../../redux/slides/tagSlide";
import AnswerEditor from "../../components/AnswerComponent/AnswerComponent";
import parse from "html-react-parser";
import { genComponentStyleHook } from "antd/es/theme/internal";

const QuestionDetails = () => {
  const navigate = useNavigate();
  const [showTextArea, setShowTextArea] = useState(false);
  const [content, setContent] = useState("");
  const [userAns, setIdUser] = useState("");
  const [imageSrcs, setImageSrcs] = useState([]); // Chứa nhiều ảnh đã chọn
  const user = useSelector((state) => state.user);
  const [answers, setAnswers] = useState([]); // State để lưu trữ danh sách câu trả lời
  // const [idQues, setIdQues] = useState("");
  // const [userCom, setIdUserCom] = useState('');
  const [comments, setComments] = useState([]);
  const [TextCom, setTextCom] = useState("");
  const [upVotes, setUpVotes] = useState(0); // Số lượt upvote hiện tại
  const [reportedCommentList, setReportedCommentList] = useState([]);
  const [reportedAnswerList, setReportedAnswerList] = useState([]);
  const [comconten, setComConten] = useState("");
  const location = useLocation();
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  // console.log("user", user)

  // const [userDetails, setUserDetails] = useState(null); // State lưu thông tin người hỏi

  // const question = useSelector((state) => state.question);
  const dispatch = useDispatch();
  const { questionId } = useParams(); // Lấy ID câu hỏi từ URL

  // Lấy dữ liệu chi tiết của câu hỏi từ Redux store
  const questionDetail = useSelector((state) => state.question.detailQuestion);

  const detailAsker = useSelector((state) => state.question.detailAsker);
  // console.log("detailAsker", detailAsker);

  const allTags = useSelector((state) => state.tag.allTag);
  // console.log("allTags", allTags);

  const mutation = useMutationHook((data) => AnswerService.addAns(data));
  const { data, isLoading, isSuccess, isError } = mutation;

  const mutationComment = useMutationHook((dataCom) =>
    CommentService.addComment(dataCom)
  );
  const { dataCom, isLoadingCom, isSuccessCom, isErrorCom } = mutationComment;

  const [quesVoteStatus, setQuesVoteStatus] = useState({
    hasVoted: false,
    type: null,
  });
  const [ansVoteStatus, setAnsVoteStatus] = useState({
    hasVoted: false,
    type: null,
  });

  useEffect(() => {
    // Kiểm tra trạng thái vote khi load page
    const checkQuesStatus = async () => {
      try {
        const status = await QuestionVoteService.checkVoteStatus(
          user?.id,
          questionId
        );
        setQuesVoteStatus(status.data);
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkQuesStatus();
  }, [user?.id, questionId]);

  //load comment bị report
  useEffect(() => {
    // Lấy danh sách đã báo cáo từ localStorage
    const reported = JSON.parse(localStorage.getItem("reportedComments")) || [];
    setReportedCommentList(reported);
  }, []);

  //load answer bị report
  useEffect(() => {
    const reportedAnswers =
      JSON.parse(localStorage.getItem("reportedAnswers")) || [];
    setReportedAnswerList(reportedAnswers);

    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) => ({
        ...answer,
        isReported: reportedAnswers.includes(answer._id),
      }))
    );
  }, []);

  useEffect(() => {
    const checkAnswerVoteStatus = async () => {
      try {
        // Lấy danh sách câu trả lời và kiểm tra trạng thái vote của mỗi câu trả lời
        const voteStatusPromises = answers.map(async (answer) => {
          try {
            // Kiểm tra trạng thái vote của câu trả lời
            const status = await AnswerVoteService.checkVoteStatus(
              user?.id,
              answer._id
            );
            return { answerId: answer._id, voteStatus: status.data };

            // Trả về trạng thái vote
          } catch (error) {
            console.error("Error checking vote status for answer:", error);
            return { answerId: answer._id, voteStatus: null }; // Trả về null nếu có lỗi
          }
        });

        // Chờ tất cả các promise hoàn thành
        const voteStatuses = await Promise.all(voteStatusPromises);

        // Cập nhật trạng thái vote của các câu trả lời
        const voteStatusMap = voteStatuses.reduce(
          (acc, { answerId, voteStatus }) => {
            acc[answerId] = voteStatus; // Lưu trạng thái vote của từng câu trả lời
            return acc;
          },
          {}
        );

        setAnsVoteStatus(voteStatusMap); // Cập nhật trạng thái vote vào state
      } catch (error) {
        console.error("Error checking vote statuses:", error);
      }
    };

    if (answers.length > 0 && userAns) {
      checkAnswerVoteStatus(); // Gọi hàm kiểm tra trạng thái vote nếu có câu trả lời và user đã đăng nhập
    }
  }, [answers]); // Chạy lại effect khi answers hoặc user thay đổi

  const createVoteNotification = async (userId, questionId) => {
    try {
      // Lấy thông tin vote của câu hỏi
      const quesVoteData = await QuestionVoteService.getVote(
        userId,
        questionId
      );

      // Kiểm tra nếu không có dữ liệu vote, thoát ra
      if (!quesVoteData || !quesVoteData.data) {
        throw new Error("Không tìm thấy dữ liệu vote.");
      }

      // Tạo dữ liệu thông báo
      const notificationData = {
        user_id: questionDetail?.data?.userQues, // user của câu hỏi
        message: "Một người đã vote cho câu hỏi của bạn",
        type: "vote",
        metadata: {
          question_id: questionId,
          quesVote_id: quesVoteData.data?._id, // ID của vote
        },
      };

      // Gọi API để tạo thông báo
      await NotificationService.createNotification(notificationData);
    } catch (error) {
      console.error("Error creating vote notification:", error);
      // Có thể xử lý lỗi tại đây như trả về thông báo cho người dùng hoặc log lỗi
    }
  };

  // Hàm xử lý UpVote
  const handleQuesUpVote = async () => {
    try {
      if (!quesVoteStatus.hasVoted) {
        // Nếu chưa vote, thực hiện upvote
        await QuestionService.addVote(questionId, user?.id, true);
        setQuesVoteStatus({ hasVoted: true, type: true });
      } else if (quesVoteStatus.type === true) {
        // Nếu đã upvote, hủy upvote
        await QuestionService.addVote(questionId, user?.id, true);
        setQuesVoteStatus({ hasVoted: false, type: null });
      } else if (quesVoteStatus.type === false) {
        // Nếu đã downvote, thay đổi thành upvote
        await QuestionService.addVote(questionId, user?.id, true);
        setQuesVoteStatus({ hasVoted: true, type: true });
      }
      // Cập nhật lại số lượng vote sau khi upvote
      const updatedQuestion = await QuestionService.getDetailsQuestion(
        questionId
      );
      dispatch(setDetailQuestion(updatedQuestion));
      createVoteNotification(user?.id, questionId);
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  // Hàm xử lý DownVote
  const handleQuesDownVote = async () => {
    try {
      if (!quesVoteStatus.hasVoted) {
        // Nếu chưa vote, thực hiện downvote
        await QuestionService.addVote(questionId, user?.id, false);
        setQuesVoteStatus({ hasVoted: true, type: false });
      } else if (quesVoteStatus.type === false) {
        // Nếu đã downvote, hủy downvote
        await QuestionService.addVote(questionId, user?.id, false);
        setQuesVoteStatus({ hasVoted: false, type: null });
      } else if (quesVoteStatus.type === true) {
        // Nếu đã upvote, thay đổi thành downvote
        await QuestionService.addVote(questionId, user?.id, false);
        setQuesVoteStatus({ hasVoted: true, type: false });
      }
      const updatedQuestion = await QuestionService.getDetailsQuestion(
        questionId
      );
      dispatch(setDetailQuestion(updatedQuestion));
      createVoteNotification(user?.id, questionId);
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  const handleAnsUpVote = async (answerId) => {
    try {
      const currentVoteStatus = ansVoteStatus[answerId];
      let newUpVoteCount = answers.find(
        (answer) => answer._id === answerId
      ).upVoteCount;
      let newDownVoteCount = answers.find(
        (answer) => answer._id === answerId
      ).downVoteCount;
      if (currentVoteStatus?.type === true) {
        // Nếu đã upvote, hủy bỏ upvote
        await AnswerService.addVote(answerId, user?.id, true);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: false, type: null },
        }));
        newUpVoteCount -= 1;
      } else if (currentVoteStatus?.type === false) {
        // Nếu đã downvote, chuyển thành upvote
        await AnswerService.addVote(answerId, user?.id, true);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: true, type: true },
        }));
        newUpVoteCount += 1;
        newDownVoteCount -= 1;
      } else {
        // Nếu chưa vote, thực hiện upvote
        await AnswerService.addVote(answerId, user?.id, true);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: true, type: true },
        }));
        newUpVoteCount += 1;
      }

      // Cập nhật lại số lượng vote sau khi thực hiện action
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                upVoteCount: newUpVoteCount,
                downVoteCount: newDownVoteCount,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("Error handling upvote for answer:", error);
    }
  };

  // Hàm xử lý DownVote
  const handleAnsDownVote = async (answerId) => {
    try {
      const currentVoteStatus = ansVoteStatus[answerId];
      let newUpVoteCount = answers.find(
        (answer) => answer._id === answerId
      ).upVoteCount;
      let newDownVoteCount = answers.find(
        (answer) => answer._id === answerId
      ).downVoteCount;
      if (currentVoteStatus?.type === false) {
        // Nếu đã downvote, hủy bỏ downvote
        await AnswerService.addVote(answerId, user?.id, false);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: false, type: null },
        }));
        newDownVoteCount -= 1;
      } else if (currentVoteStatus?.type === true) {
        // Nếu đã upvote, chuyển thành downvote
        await AnswerService.addVote(answerId, user?.id, false);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: true, type: false },
        }));
        newUpVoteCount -= 1; // Giảm số lượng upvote
        newDownVoteCount += 1;
      } else {
        // Nếu chưa vote, thực hiện downvote
        await AnswerService.addVote(answerId, user?.id, false);
        setAnsVoteStatus((prevState) => ({
          ...prevState,
          [answerId]: { hasVoted: true, type: false },
        }));
        newDownVoteCount += 1;
      }

      // Cập nhật lại số lượng vote sau khi thực hiện action
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                upVoteCount: newUpVoteCount,
                downVoteCount: newDownVoteCount,
              }
            : answer
        )
      );
    } catch (error) {
      console.error("Error handling downvote for answer:", error);
    }
  };

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
      const response = await AnswerService.getAnswersByQuestionId(questionId);
      const answersWithUserDetails = await Promise.all(
        response.data.data.map(async (answer) => {
          const userInfo = await fetchUserDetails(answer.userAns);
          return {
            ...answer,
            userName: userInfo.name,
            userImg: userInfo.img
          };
        })
      );
      setAnswers(answersWithUserDetails); // Cập nhật danh sách câu trả lời với tên người dùng và ảnh
    } catch (error) {
      console.error("Error fetching answers with user details:", error);
    }
  };

  // Gọi hàm này thay cho `fetchAnswers`
  useEffect(() => {
    fetchAnswersWithUserDetails();
  }, [questionId]);

  const reloadPage = () => {
    window.location.reload();
  };

  //handle answer content
  const handleContentChange = (value) => {
    if (value !== content) {
      setContent(value);
    }
  };

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

  const handleContentCom = (value, n) => {
    setComConten(value);
  };

  console.log("vvjjbh", questionDetail);

  // useEffect(() => {
  //   if (question?.id) {
  //     setIdQues(question.id);
  //   }
  // }, [question]);

  //Upload anh
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      new Compressor(file, {
        quality: 0.6, // Quality (60%)
        maxWidth: 800, // Max width
        maxHeight: 800, // Max height
        success(result) {
          // Tạo URL tạm cho các ảnh đã nén
          const compressedImage = URL.createObjectURL(result);
          setImageSrcs((prevImages) => [...prevImages, compressedImage]); // Thêm ảnh vào mảng
        },
        error(err) {
          console.error(err);
        },
      });
    });
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = useCallback((index) => {
    setImageSrcs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  //useEffect them cau tra loi
  useEffect(() => {
    if (isSuccess && data?.status !== "ERR") {
      message.success();
      alert("Answer has been added successfully!");
      fetchAnswersWithUserDetails(); // Cập nhật danh sách câu trả lời sau khi thêm
    }
    if (isError) {
      message.error();
    }
  }, [isSuccess, isError]);

  //them binh luan
  useEffect(() => {
    if (isSuccessCom && dataCom?.status !== "ERR") {
      message.success();
      alert("Comment has been added successfully!");
    }
    if (isErrorCom) {
      message.error();
    }
  }, [isSuccessCom, isErrorCom]);

  const mutationUpdate = useMutationHook((id) =>
    UserService.updateAnswerCount(id)
  );
  const {
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: isSuccessUpdate,
    isError: isErrorUpdate,
  } = mutationUpdate;

  //Xóa bình luận
  const deleteMutation = useMutationHook((data) =>
    CommentService.deleteComment(data)
  );
  const { isSuccess: isSuccessDelete, isError: isErrorDelete } = deleteMutation;
  useEffect(() => {
    if (isErrorDelete) {
      message.error();
    }
  }, [isSuccessDelete, isErrorDelete]);

  const handleDeleteComment = (comment, event) => {
    // Ngừng sự kiện lan truyền
    event.stopPropagation();
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (isConfirmed) {
      deleteMutation.mutate(comment);
      alert("Question deleted successfully!");
    }
    reloadPage();
  };

  //useEffect cho update answerCount cua User
  useEffect(() => {
    if (isSuccessUpdate && dataUpdate?.status !== "ERR") {
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
      if (response?.status !== "ERR") {
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

        // Gửi thông báo
        const notificationData = {
          user_id: questionDetail?.data?.userQues,
          message: "You have a new answer to your question.",
          type: "answer",
          metadata: {
            question_id: questionId,
            answer_id: response?.data?._id || "Unknown Answer ID",
          },
        };

        await NotificationService.createNotification(notificationData);

        // Hiển thị thông báo thành công
        message.success("Answer has been added successfully!");
      } else {
        throw new Error(response?.message || "Failed to add answer.");
      }
    } catch (error) {
      console.error("Error while posting answer:", error);
      message.error("An error occurred. Please try again.");
    }
  }, [
    content,
    imageSrcs,
    mutation,
    questionDetail.data?.answerCount,
    questionId,
    user,
    fetchAnswersWithUserDetails,
  ]);

  // console.log("COUNT", questionDetail.data)

  useEffect(() => {
    fetchAnswersWithUserDetails(); // Gọi hàm để lấy danh sách câu trả lời khi component mount
  }, [questionId]);

  const handleCancelClick = useCallback(() => {
    alert("Cancel adding the question!");
  }, []);

  //Ham thay thong tin user theo ID
  const fetchUserDetails = async (userId) => {
    try {
      const userDetails = await UserService.getDetailsUser(userId);
      return {
        name: userDetails?.data?.name || "Unknown User",
        img: userDetails?.data?.img || "https://via.placeholder.com/40"
      }; // Trả về cả name và img
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        name: "Unknown User",
        img: "https://via.placeholder.com/40"
      }; // Giá trị fallback
    }
  };

  useEffect(() => {
    if (isSuccessCom && dataCom?.status !== "ERR") {
      message.success();
      alert("Comment has been added successfully!");
      navigate("/Comment");
    }
    if (isErrorCom) {
      message.error();
    }
  }, [isSuccessCom, isErrorCom]);

  //Lấy tất cả comment của
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
    error: errorCom,
  } = useQuery({
    queryKey: ["commentAns"],
    queryFn: getAllComAns,
  });

  const useCommentsForAnswers = (answers) => {
    return useQuery({
      queryKey: ["commentsForAnswers", answers.map((a) => a._id)],
      queryFn: async () => {
        // Sử dụng Promise.all để xử lý đồng thời
        const comments = await Promise.all(
          answers.map((answer) =>
            CommentService.getCommentByQuestionId(answer._id)
          )
        );
        return comments;
      },
      enabled: !!answers?.length, // Chỉ chạy khi có danh sách câu trả lời
    });
  };
  const {
    data: comments2,
    isLoading: isLoading2,
    error: error2,
  } = useCommentsForAnswers(answers);

  const handleAddCommentClick = useCallback(async () => {
    if (!user?.id) {
      alert("Please log in to comment!");
      navigate("/login", { state: location?.pathname });
    } else if (!user?.active) {
      alert("Your account is inactive. You cannot add a comment at this time.");
    } else {
      const commentData = {
        content: TextCom,
        user: userAns,
        question: questionId,
      };

      await mutationComment.mutateAsync(commentData);
      setTextCom("");
      alert("Comment has been added successfully!");

      reloadPage();
    }
  }, [content, mutationComment, answers, user]);

  const handleAddCommentClick2 = useCallback(
    async (answerId, n) => {
      if (!userAns) {
        alert("Please log in to comment!");
        navigate("/login", { state: location?.pathname });
      } else if (!user?.active) {
        alert(
          "Your account is inactive. You cannot add a comment at this time."
        );
      } else {
        const commentData = {
          content: comconten,
          user: userAns,
          answer: selectedAnswerId,
          question: questionId,
        };

        await mutationComment.mutateAsync(commentData);
        setComConten("");
        alert("Comment has been added successfully!");

        reloadPage();
      }
    },
    [content, mutationComment, answers, user]
  );

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

  //report answer
  // console.log("answers", answers);
  const handleAnswerReport = async (answerId) => {
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

      const response = await AnswerReportService.createAnswerReport({
        answer: answerId, // ID của bình luận
        user: user.id, // ID của người dùng
      });

      // Kiểm tra trước khi thêm vào danh sách báo cáo
      if (!reportedAnswerList.includes(answerId)) {
        const updatedAnswerList = [...reportedAnswerList, answerId];
        setReportedAnswerList(updatedAnswerList);
        localStorage.setItem(
          "reportedAnswers",
          JSON.stringify(updatedAnswerList)
        );
      }

      // Đồng bộ trạng thái `isReported` trong `answers`
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer._id === answerId ? { ...answer, isReported: true } : answer
        )
      );

      console.log("Report submitted successfully:", response);

      // Cập nhật danh sách các bình luận đã báo cáo
      // setReportedCommentList((prev) => [...prev, commentQuess._id]);

      alert(response.message); // Thông báo sau khi báo cáo thành công
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("An error occurred while reporting the comment.");
    }
  };
  const quesDate = new Date(questionDetail.data?.createdAt).toLocaleString();

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
            Asked {quesDate || "Unknown time"}
          </p>
        </div>
      </div>

      {/* Phần tiêu đề câu hỏi */}
      <div className="mb-4">
        <h3>{questionDetail.data?.title || "Question Title"}</h3>
        <p className="text-secondary">
          <span className="me-3">{questionDetail.data?.view} views</span>
          <div>
            <button
              className="btn me-2"
              style={{
                backgroundColor:
                  quesVoteStatus.type === true
                    ? "green"
                    : quesVoteStatus.hasVoted === false
                    ? "gray"
                    : "gray",
                color: "white",
              }}
              onClick={() => handleQuesUpVote()}
            >
              ▲
            </button>
            +{questionDetail.data?.upVoteCount}
          </div>
          <div style={{ marginTop: "10px" }}>
            <button
              className="btn"
              style={{
                backgroundColor:
                  quesVoteStatus.type === false
                    ? "red"
                    : quesVoteStatus.hasVoted === false
                    ? "gray"
                    : "gray",
                color: "white",
                marginRight: "12px",
              }}
              onClick={() => handleQuesDownVote()}
            >
              ▼
            </button>
            -{questionDetail.data?.downVoteCount}
          </div>
        </p>
      </div>

      {/* Nội dung bài viết */}
      <div className="bg-light p-4 rounded mb-4">
        <p className="mt-3" style={{ fontSize: "20px" }}>
          Content:
        </p>
        <p
          dangerouslySetInnerHTML={{
            __html: questionDetail.data?.content || "No content provided",
          }}
        ></p>
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

        {/* <p className="mt-3" style={{ fontSize: "20px" }}>
          Expected Result:
        </p>
        <div className="bg-light border rounded p-2">
          <p
            dangerouslySetInnerHTML={{
              __html: questionDetail.data?.note || "",
            }}
          ></p>
        </div> */}

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

      {/* Related Quizzes */}
      {questionDetail.data?.linkedQuizzes &&
        questionDetail.data.linkedQuizzes.length > 0 && (
          <LinkedQuizzes quizzes={questionDetail.data.linkedQuizzes} />
        )}

      {/* Phần bình luận */}
      <div className="mb-4">
        <h5 className="mb-3"> Comments</h5>
        {Array.isArray(commentQuess) && commentQuess.length > 0 ? (
          commentQuess.map((commentQues) => {
            //const user = userInfo[commentQues._id] || {}; // Tránh truy cập vào undefined
            const isCurrentUser = commentQues.user._id === user.id; // So sánh user của comment với userId
            return isCurrentUser ? (
              <Comment2
                name={commentQues.user.name || "Unknown"}
                img={commentQues.user.img || "https://via.placeholder.com/40"}
                text={commentQues.content || "Unknown"}
                date={new Date(commentQues.createdAt).toLocaleString()}
                key={commentQues._id || commentQues.id || commentQues}
                onReport={() => handleCommentReport(commentQues)}
                isReported={reportedCommentList.includes(commentQues._id)}
                onclick1={(event) =>
                  handleDeleteComment(commentQues._id, event)
                }
              />
            ) : (
              <Comment
                name={commentQues.user.name || "Unknown"}
                img={commentQues.user.img || "https://via.placeholder.com/40"}
                text={commentQues.content || "Unknown"}
                date={new Date(commentQues.createdAt).toLocaleString()}
                key={commentQues._id || commentQues.id || commentQues}
                onReport={() => handleCommentReport(commentQues)}
                isReported={reportedCommentList.includes(commentQues._id)}
              />
            );
          })
        ) : (
          <p>No comments available.</p>
        )}
      </div>
      <div className="mt-4">
        <textarea
          className="form-control"
          placeholder="Add a comment"
          rows="2"
          value={TextCom}
          onChange={(e) => handleTextCom(e.target.value)}
        ></textarea>
      </div>
      <ButtonComponent
        textButton="Submit comment"
        onClick={handleAddCommentClick}
        style={{ margin: "20px 0px" }}
      />

      {/* Danh sách câu trả lời */}
      <div>
        <h5 className="mb-3">
          {answers.length} Answer{answers.length > 1 ? "s" : ""}
        </h5>
        {Array.isArray(answers) && answers.length > 0 ? (
          answers.map((answer, index) => {
            const comments = useCommentsForAnswers[answer._id] || [];
            return (
              <div
                key={index}
                className="d-flex align-items-start p-3 border rounded mb-3"
              >
                {/* Phần bỏ phiếu nằm bên trái, cùng dòng với nội dung */}
                <div className="vote-buttons me-3 d-flex flex-column align-items-center">
                  <div>
                    <button
                      className="btn me-2"
                      style={{
                        backgroundColor:
                          ansVoteStatus[answer._id]?.type === true
                            ? "green"
                            : ansVoteStatus[answer._id]?.hasVoted === false
                            ? "gray"
                            : "gray",
                        color: "white",
                      }}
                      onClick={() => handleAnsUpVote(answer._id)}
                    >
                      ▲
                    </button>
                    +{answer.upVoteCount}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <button
                      className="btn"
                      style={{
                        backgroundColor:
                          ansVoteStatus[answer._id]?.type === false
                            ? "red"
                            : ansVoteStatus[answer._id]?.hasVoted === false
                            ? "gray"
                            : "gray",
                        color: "white",
                        marginRight: "12px",
                      }}
                      onClick={() => handleAnsDownVote(answer._id)}
                    >
                      ▼
                    </button>
                    -{answer.downVoteCount}
                  </div>
                </div>

                {/* Phần hiển thị câu trả lời nằm bên phải */}
                <div className="answer-content flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    {/* Thông tin người trả lời */}
                    <div className="d-flex align-items-center">
                      <img
                        src={answer.userImg || "https://via.placeholder.com/40"}
                        alt="Answerer Avatar"
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                      />
                      <div>
                        <strong>{answer.userName || "Loading..."}</strong>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "0.9em" }}
                        >
                          Answered {new Date(answer.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {/* Nút Report */}
                    <button
                      className={`report-button ${
                        answer.isReported ? "reported" : ""
                      }`}
                      disabled={answer.isReported} // Vô hiệu hóa nút nếu đã report
                      onClick={() => handleAnswerReport(answer._id)} // Gọi hàm report
                    >
                      {answer.isReported ? "Reported" : "Report"}
                    </button>
                  </div>

                  <p>{parse(answer.content)}</p>
                  {answer.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img || "https://via.placeholder.com/150"}
                      alt={`Answer Image ${index}`}
                      className="img-fluid rounded my-2"
                    />
                  ))}
                  <div>
                    <h5 className="mb-3"> Comments</h5>
                    {Array.isArray(commentAns) && commentAns.length > 0 ? (
                      commentAns
                        .filter(
                          (commentQues) => commentQues.answer === answer._id
                        ) // Lọc các comment có answer = answer.id
                        .map((commentQues) => {
                          //const user = userInfo[commentQues._id] || {}; // Tránh truy cập vào undefined
                          const isCurrentUser =
                            commentQues.user._id === user.id; // So sánh user của comment với userId
                          return isCurrentUser ? (
                            <Comment2
                              name={commentQues.user.name || "Unknown"}
                              img={commentQues.user.img || "https://via.placeholder.com/40"}
                              text={commentQues.content || "Unknown"}
                              date={new Date(
                                commentQues.createdAt
                              ).toLocaleString()}
                              key={
                                commentQues._id || commentQues.id || commentQues
                              }
                              onReport={() => handleCommentReport(commentQues)}
                              isReported={reportedCommentList.includes(
                                commentQues._id
                              )}
                              onclick1={(event) =>
                                handleDeleteComment(commentQues._id, event)
                              }
                            />
                          ) : (
                            <Comment
                              name={commentQues.user.name || "Unknown"}
                              img={commentQues.user.img || "https://via.placeholder.com/40"}
                              text={commentQues.content || "Unknown"}
                              date={new Date(
                                commentQues.createdAt
                              ).toLocaleString()}
                              key={
                                commentQues._id || commentQues.id || commentQues
                              }
                              onReport={() => handleCommentReport(commentQues)}
                              isReported={reportedCommentList.includes(
                                commentQues._id
                              )}
                            />
                          );
                        })
                    ) : (
                      <p>No comments available.</p>
                    )}
                  </div>
                  <ButtonComponent
                    textButton="Add comment"
                    onClick={() => setSelectedAnswerId(answer._id)}
                  />
                  {selectedAnswerId === answer._id && (
                    <div>
                      <textarea
                        className="form-control"
                        placeholder="Add a comment"
                        rows="2"
                        value={comconten}
                        onChange={(e) => handleContentCom(e.target.value)}
                      ></textarea>
                      <ButtonComponent
                        textButton="Submit comment"
                        onClick={() =>
                          handleAddCommentClick2(answer._id, index)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No answers available.</p>
        )}

        {/* Thêm các câu trả lời khác */}
        <AnswerEditor
          content={content}
          onContentChange={handleContentChange}
          onCancel={handleCancelClick}
          isLoading={isLoading}
          imageSrcs={imageSrcs}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onSubmit={handlePostAnswerClick}
        />
      </div>
    </div>
  );
};

export default QuestionDetails;

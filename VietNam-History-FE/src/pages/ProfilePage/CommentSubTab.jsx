import React, {useEffect,  useState } from "react";
import QuestionHolder from "../../components/UserComment/QuestionHolder";
import "../../css/AnswerSubTab.css";
import { useSelector } from "react-redux";
import * as CommentService from "../../services/CommentService";

const CommentSubTab = (commentQuantity) => {
   const user = useSelector((state) => state.user);
   const [statusMessage, setStatusMessage] = useState(null);
    
const [commentCount, setCommentCount] = useState(0);
 useEffect(() => {
       // Hàm lấy số lượng câu hỏi
       const fetchCommentCount = async () => {
         try {
           const response = await CommentService.getCommentByUserId(user.id);
         
           setCommentCount(response?.length || 0); 
         } catch (error) {
           setStatusMessage({
             type: "Error",
             message: error.message || "Đã xảy ra lỗi khi tải dữ liệu.",
           });
         }
       };
     
       // Gọi hàm fetch khi userId thay đổi
       if (user.id) {
         fetchCommentCount();
       }
     
     }, [user.id]); 
  return (
    <div>
      <div className="title">
        <h3>Comments {commentCount} </h3>
      </div>
      <div className="comment-list">
        <QuestionHolder></QuestionHolder>
      </div>
    </div>
  );
};

export default CommentSubTab;

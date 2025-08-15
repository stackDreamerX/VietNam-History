import axios from "axios";

// Thêm câu trả lời
export const addComment = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/comment/create-comment`, data);
    return res.data;
};

// Lấy tất cả bình luận theo ID câu hỏi
export const getAllComment = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/comment/get-all-comment/${id}`);

    return res.data;
};

// Lấy câu trả lời theo ID câu hỏi
export const getCommentByQuestionId = async (questionId) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/comment/comments/${questionId}`);
    return res.data;
};

// Lấy bình luận theo ID người dùng
export const getCommentByUserId = async (userId) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/comment/byUser/${userId}`);
    return res.data;
};

// Xóa bình luận
export const deleteComment = async (comId) => {
    const res = await axios.delete(
      `${process.env.REACT_APP_API_URL_BACKEND}/comment/delete-comment/${comId}`);
    return res.data;
  };


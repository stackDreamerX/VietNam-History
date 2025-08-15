import axios from "axios";
export const axiosJWT = axios.create();

// Thêm câu trả lời
export const addAns = async (data) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/answer/create-answer`, data);
  return res.data;
};

// Lấy tất cả câu trả lời theo ID câu hỏi
export const getAllAns = async (id) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/answer/get-all/${id}`);
  return res.data;
};

export const getDetailsAnswer = async (id) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/answer/get-detail-answer/${id}`);
  return res.data;
};

// Lấy câu trả lời theo ID câu hỏi
export const getAnswersByQuestionId = async (ansId) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/answer/get-by-question/${ansId}`);
  return res.data;
};

// Lấy câu trả lời theo ID câu hỏi
export const getAnswersByQuestionIdAdmin = async (ansId) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/answer/admin/get-by-question/${ansId}`);
  return res.data;
};

export const updateAnswerStatus = async (answerId, isActive) => {
  return await axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/answer/toggle-active/${answerId}`, { active: isActive });
};


export const getStatisticAnswer = async (userAns, year, month) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/answer/get-by-statistic?userAns=${userAns}&&year=${year}&&month=${month}`);
  return response.data;
};

export const addVote = async (answerId, userId, isUpVote) => {
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/answer/${answerId}/vote`,
      { answerId, userId, isUpVote }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi thêm vote.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const getAnswersByUserId = async (userId) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/answer/user/${userId}`
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const deleteAnswer = async (ansId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL_BACKEND}/answer/delete-answer/${ansId}`);
  return res.data;
};


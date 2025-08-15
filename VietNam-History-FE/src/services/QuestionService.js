import axios from "axios";
export const axiosJWT = axios.create();

export const addQues = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/create-question`,
    data
  );
  return res.data;
};

export const getAllQues = async (data) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/get-all-question`,
    data
  );
  return res.data;
};

export const getAllQuesByTag = async (tagId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/get-all-question?tag=${tagId}`
  );
  return res.data;
};

export const toggleActiceQues = async (quesId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/toggle-active/${quesId}`);
  return res.data;
};

export const getDetailsQuestion = async (id) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/get-detail-question/${id}`
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        // status: error.response.data?.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const updateQuestion = async (questionId, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/update-question/${questionId}`,
    data
  );
  return res.data;
};

export const deleteQuestion = async (quesId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/delete-question/${quesId}`);
  return res.data;
};



export const getQuestionsByUserId = async (userId) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/user/${userId}`
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

export const updateAnswerCount = async (questionId, newAnswerCount) => {

  console.log("hhhh", newAnswerCount);
  console.log("ID", questionId);


  const response = await axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/question/update-answer-count/${questionId}`, {
    answerCount: newAnswerCount,
  });
  return response.data;
};


export const getQuestionsFromUserAnswers = async (userId) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/answers/user/${userId}`
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

export const getQuestionsFromUserComments = async (userId) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/comments/user/${userId}`
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

export const addVote = async (questionId, userId, isUpVote) => {
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/${questionId}/vote`,
      { questionId, userId, isUpVote }
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


export const getStatisticQuestion = async (userQues, year, month) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/question/get-by-statistic?userQues=${userQues}&&year=${year}&&month=${month}`);
  return response.data;
};

// export const getAllQuestionByActive = async (active) => {
//   const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/question/get-all-question?active=${active}`);
//   return response.data;
// };

export const getAllQuestionByActive = async (active, page = 1, limit = 10) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/get-all-question`, {
    params: {
      active,
      page,
      limit,
    },
  }
  );
  console.log("RES", response.data)
  return response.data;
};

export const searchQuestion = async (tags = [], keyword = '', page = 1, limit = 10, sort = {}) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/search`,
      {
        params: {
          tags: tags.join(','), // Join tags array into a comma-separated string
          keyword,
          page,
          limit,
          sortField: sort.field || '', // Optional sorting field
          sortOrder: sort.order || '', // Optional sorting order
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi tìm kiếm câu hỏi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};


// export const updateAnswerCount = async (id, data) => {
//   try {
//     const res = await axiosJWT.put(
//       `${process.env.REACT_APP_API_URL_BACKEND}/user/update-answercount/${id}`,
//       data,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           //token: `Bearer ${access_token}`,
//         },
//       }
//     );
//     return res.data; // Trả dữ liệu nếu thành công
//   } catch (error) {
//     // Nếu API trả về lỗi, ném lỗi với thông tin chi tiết
//     if (error.response) {
//       // API trả về response
//       throw {
//         // status: error.response.data?.status || "ERR",
//         message: error.response.data?.message || "Đã xảy ra lỗi.",
//       };
//     } else {
//       // Lỗi không có response (ví dụ lỗi mạng)
//       throw { status: 500, message: "Không thể kết nối đến máy chủ." };
//     }
//   }
// };


export const updateViewCount = async (id, userId) => {
  const response = await axios.put(`${process.env.REACT_APP_API_URL_BACKEND}/question/update-view/${id}/${userId}`);
  return response.data;
};

export const updateReportCount = async (questionId, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/question/update-report-count/${questionId}`,
    data
  );
  return res.data;
};

export const getDetailsQuestionForAdmin = async (id) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question/get-detail-question/${id}`
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
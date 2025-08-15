import axios from "axios";
export const axiosJWT = axios.create();

export const checkVoteStatus = async (userId, questionId) => {
  try {
    // Gọi API để kiểm tra trạng thái vote của người dùng
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question-vote/vote-status/${userId}/${questionId}`,
      { params: { userId, questionId } }
    );

    // Nếu không có vote thì trả về false
    if (!response.data || !response.data.data.hasVoted) {
      return {
        status: 'OK',
        message: 'No vote found',
        data: { hasVoted: false },
      };
    }

    // Nếu có vote thì trả về thông tin về loại vote
    return {
      status: 'OK',
      message: 'Vote found',
      data: { hasVoted: true, type: response.data.data.type },
    };
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || 'Lỗi khi kiểm tra trạng thái vote.',
      };
    } else {
      throw {
        status: 500,
        message: 'Không thể kết nối đến máy chủ.',
      };
    }
  }
};

export const getVotesAndQuestionsFromUser = async (userId) => {
  try {
    // Gọi API để lấy thông tin vote và câu hỏi từ userId
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question-vote/votes/questions/${userId}`
    );
    return res.data; // Trả về dữ liệu từ API
  } catch (error) {
    if (error.response) {
      // Trả về lỗi từ phản hồi của server
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Trả về lỗi khi không kết nối được với máy chủ
      throw {
        status: 500,
        message: "Không thể kết nối đến máy chủ.",
      };
    }
  }
};

export const getVote = async (userId, questionId) => {
  try {
    // Gọi API để lấy thông tin vote và câu hỏi từ userId
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/question-vote/vote-detail/${userId}/${questionId}`
    );
    return res.data; // Trả về dữ liệu từ API
  } catch (error) {
    if (error.response) {
      // Trả về lỗi từ phản hồi của server
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Trả về lỗi khi không kết nối được với máy chủ
      throw {
        status: 500,
        message: "Không thể kết nối đến máy chủ.",
      };
    }
  }
};

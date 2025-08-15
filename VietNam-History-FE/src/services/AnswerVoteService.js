import axios from "axios";
export const axiosJWT = axios.create();

export const checkVoteStatus = async (userId, answerId) => {
  try {
    // Gọi API để kiểm tra trạng thái vote của người dùng
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/answer-vote/vote-status/${userId}/${answerId}`,
      { params: { userId, answerId } }
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

export const getVotesAndAnswersFromUser = async (userId) => {
  try {
    // Gọi API để lấy thông tin vote và câu trả lời từ userId
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/answer-vote/votes/answers/${userId}`
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
import axios from "axios";

export const createCommentReport = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/comment-report/create-comment-report`,
      data
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        status: error.response.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

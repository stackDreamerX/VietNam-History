import axios from "axios";

export const createQuestionReport = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/question-report/create-question-report`,
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

import axios from "axios";

/**
 * Process a user query and get a response from the chatbot
 * @param {string} query - The user's query text
 * @param {string} userId - Optional user ID for personalized responses
 * @returns {Promise} - The response from the chatbot API
 */
export const processQuery = async (query, userId = null) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/chatbot/process-query`,
      { query, userId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi xử lý tin nhắn.",
      };
    } else {
      throw { message: "Không thể kết nối đến máy chủ." };
    }
  }
};

/**
 * Get details of a specific article
 * @param {string} articleId - The article ID
 * @returns {Promise} - The article details
 */
export const getArticleDetails = async (articleId) => {
  try {
    if (!articleId) {
      throw new Error("Article ID is required");
    }

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/chatbot/article-details/${articleId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi lấy thông tin bài viết.",
      };
    } else {
      throw { message: "Không thể kết nối đến máy chủ." };
    }
  }
};
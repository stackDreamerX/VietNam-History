import axios from "axios";

export const axiosJWT = axios.create();

export const loginUser = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/log-in`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // Trả dữ liệu nếu thành công
  } catch (error) {
    // Nếu API trả về lỗi, ném lỗi với thông tin chi tiết
    if (error.response) {
      // API trả về response
      throw {
        status: error.response.status,
        message: error.response.data.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Lỗi không có response (ví dụ lỗi mạng)
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const signupUser = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/sign-up`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // Trả dữ liệu nếu thành công
  } catch (error) {
    // Nếu API trả về lỗi, ném lỗi với thông tin chi tiết
    if (error.response) {
      // API trả về response
      throw {
        status: error.response.status,
        message: error.response.data.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Lỗi không có response (ví dụ lỗi mạng)
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const getDetailsUser = async (id) => {
  // Check if the ID is valid before making the API call
  if (!id) {
    console.warn("getDetailsUser called with invalid or missing ID");
    throw new Error("Invalid user ID");
  }

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-details/${id}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in getDetailsUser:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/refresh-token`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.warn("Error refreshing token:", error.message);
    // Don't throw further errors, just return null so the caller knows refresh failed
    return null;
  }
};

export const logoutUser = async () => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL_BACKEND}/user/log-out`
  );
  return res.data;
};

export const updateUserInfo = async (id, data, access_token) => {
  try {
    const res = await axiosJWT.put(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/update-user/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res.data; // Trả dữ liệu nếu thành công
  } catch (error) {
    // Nếu API trả về lỗi, ném lỗi với thông tin chi tiết
    if (error.response) {
      // API trả về response
      throw {
        // status: error.response.data?.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Lỗi không có response (ví dụ lỗi mạng)
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const getAllUsersExceptSelf = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-except-self`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Thêm token từ Local Storage
      },
    }
  );
  return res.data;
};

export const getAllUser = async () => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-user`,
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
        // status: error.response.data?.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const addFollower = async (id, access_token) => {
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/add-follower/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    // console.log("Response from server:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Error adding follower:",
      error.response?.data || error.message
    );
    throw error; // Re-throw error nếu cần xử lý ở nơi gọi
  }
};

export const removeFollower = async (id, access_token) => {
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/remove-follower/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    // console.log("Response from server:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Error adding follower:",
      error.response?.data || error.message
    );
    throw error; // Re-throw error nếu cần xử lý ở nơi gọi
  }
};

export const getFollowingUsers = async (accessToken) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/user/following`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.data;
};

// Trong hàm updateQuesCount
export const updateQuesCount = async (userId) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/update-ques-count/${userId}`
    );
    return response.data; // Đảm bảo trả về dữ liệu đúng
  } catch (error) {
    throw error;
  }
};

// Trong hàm updateQuesCount
export const updateAnswerCount = async (userId) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/update-answer-count/${userId}`
    );
    return response.data; // Đảm bảo trả về dữ liệu đúng
  } catch (error) {
    throw error;
  }
};
export const updateUserStatus = async (userId, isActive) => {
  return await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/user/toggle-active/${userId}`,
    { active: isActive }
  );
};

export const filterUsers = async (searchParams) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/filter`,
      {
        params: searchParams,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const filterUsersByActive = async (active) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/filter?active=${active}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (data, access_token) => {
  console.log("API URL backend:", process.env.REACT_APP_API_URL_BACKEND);
  try {
    const res = await axios.put(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/update-password`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.message || "Đổi mật khẩu thất bại.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

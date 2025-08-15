import axios from "axios";

export const axiosJWT = axios.create();

export const loginAdmin = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/log-in`,
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

export const signupAdmin = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/sign-up`,
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
        status: error.response.data?.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      // Lỗi không có response (ví dụ lỗi mạng)
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

export const getAllAdmin = async () => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-all-admin`,
      {
        headers: {
          "Content-Type": "application/json",
          //token: `Bearer ${access_token}`,
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

export const updateAdminInfo = async (id, data, access_token) => {
  try {
    const res = await axiosJWT.put(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/update-admin/${id}`,
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

export const getDetailsAdmin = async (id, access_token) => {
  if (!id || !access_token) {
    console.warn("Missing ID or access token for getDetailsAdmin");
    throw new Error("Invalid admin ID or token");
  }
  
  try {
    console.log("ACCESS", access_token);
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-detail-admin/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${access_token}`,
        },
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("Error in getDetailsAdmin:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/refresh-token`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.warn("Error refreshing admin token:", error.message);
    // Don't throw further errors, just return null
    return null;
  }
};

export const logoutAdmin = async () => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL_BACKEND}/admin/log-out`
  );
  return res.data;
};

export const deleteAdmin = async (id) => {
  try {
    console.log("ADMIN ID", id)
    const res = await axiosJWT.delete(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/delete-admin/${id}`,
      
      {
        headers: {
          "Content-Type": "application/json",
          // token: `Bearer ${access_token}`,
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

export const filterAdmin = async (searchParams) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/admin/filter`, {
      params: searchParams,
    });
    return response.data;  
  } catch (error) {
    throw error;  
  }
};


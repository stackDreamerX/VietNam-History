import axios from "axios";

export const axiosJWT = axios.create();

export const createNotification = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL_BACKEND}/notification/create-notification`,
    data
  );
  return res.data;
};

export const getNotificationById = async (id) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/notification/get-detail/${id}`
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

export const deleteNotification = async (notificationId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL_BACKEND}/notification/delete/${notificationId}`
  );
  return res.data;
};

export const markAsRead = async (notificationId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/notification/${notificationId}/read`
  );
  return res.data;
};

export const getNotificationsByUserId = async (userId) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/notification/notifications/${userId}`
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


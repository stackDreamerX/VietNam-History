import axios from "axios";
export const axiosJWT = axios.create();

export const createSaved = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL_BACKEND}/saved/create-saved`,
    data
  );
  return res.data;
};

export const getAllSaved = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL_BACKEND}/saved/get-all-saved`
  );
  return res.data;
};

export const getDetailsSaved = async (id) => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/saved/get-detail-saved/${id}`
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

export const updateSaved = async (id, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/saved/update-saved/${id}`,
    data
  );
  return res.data;
};

export const deleteSaved = async (id) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL_BACKEND}/saved/delete-saved/${id}`
  );
  return res.data;
};

const UserServices = require("../services/UserServices");
const JwtService = require("../services/JwtService");
const validator = require("validator");

//tạo tài khoản
const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, birthday } =
      req.body;
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //check email
    const isCheckEmail = reg.test(email);
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !birthday
    ) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The password is not equal confirmPassword",
      });
    }

    const response = await UserServices.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//đăng nhập
const loginUser = async (req, res) => {
  try {
    console.log(req.body);
    //test input data
    const { email, password } = req.body;
    console.log("reg.body");
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //check email
    const isCheckEmail = reg.test(email);
    console.log(email, password);
    if (!email || !password) {
      //check have
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    }

    const response = await UserServices.loginUser(req.body);
    const { refresh_token, ...newResponse } = response;
    //console.log('response', response);
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
    });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    console.log("userId", userId);
    const response = await UserServices.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await UserServices.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get info user
const getAllUser = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const response = await UserServices.getAllUser(Number(limit), Number(page));
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//get all except self

const getAllUsersExceptSelf = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Lấy ID của người đang đăng nhập từ token
    // clg("currentUserId", currentUserId);
    const users = await UserServices.getAllUsersExceptSelf(currentUserId); // Gọi Service để lấy dữ liệu
    res.status(200).json({ status: "OK", data: users });
  } catch (error) {
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

//get detail user
const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await UserServices.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//cấp token mới
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout Successfully",
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

//view follower
const viewFollower = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await UserServices.viewFollower(userId);

    // Kiểm tra response từ service và phản hồi theo tình huống
    if (response.status === "ERR") {
      return res.status(404).json(response); // Trả về mã lỗi 404 nếu user không tồn tại
    }

    return res.status(200).json(response); // Trả về thành công
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "Internal Server Error",
      error: e.message,
    });
  }
};

//add follower
const addFollower = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Lấy từ token đã xác thực
    const userIdToFollow = req.params.id;

    if (!currentUserId || !userIdToFollow) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing user ID information",
      });
    }

    const response = await UserServices.addFollower(
      currentUserId,
      userIdToFollow
    );

    res.status(200).json({
      status: "OK",
      message: "Followed successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in addFollower:", error);
    res.status(500).json({
      status: "ERR",
      message: error.message || "An error occurred while following user"
    });
  }
};

const removeFollower = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Lấy từ token đã xác thực
    const userIdToUnfollow = req.params.id;

    if (!currentUserId || !userIdToUnfollow) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing user ID information",
      });
    }

    const response = await UserServices.removeFollower(
      currentUserId,
      userIdToUnfollow
    );

    res.status(200).json({
      status: "OK",
      message: "Unfollowed successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in removeFollower:", error);
    res.status(500).json({
      status: "ERR",
      message: error.message || "An error occurred while unfollowing user"
    });
  }
};

const getFollowingUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // ID của user hiện tại (lấy từ token)
    const followingUsers = await UserServices.getFollowingUser(currentUserId);

    res.status(200).json({
      status: "OK",
      data: followingUsers, // Danh sách user mà user hiện tại đang follow
    });
  } catch (error) {
    if (error.message === "User  not found") {
      return res.status(404).json({
        status: "ERR",
        message: error.message,
      });
    }
    res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateQuesCount = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await UserServices.updateQuesCount(id);
    if (updatedUser) {
      return res.status(200).json({
        message: "QuesCount updated successfully",
        data: updatedUser,
      });
    }
    return res.status(404).json({
      message: "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateAnswerCount = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await UserServices.updateAnswerCount(id);
    if (updatedUser) {
      return res.status(200).json({
        message: "QuesCount updated successfully",
        data: updatedUser,
      });
    }
    return res.status(404).json({
      message: "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const toggleActiveUser = async (req, res) => {
  const { id } = req.params; // Lấy id từ tham số route
  console.log("ID", id);
  // Kiểm tra xem id có tồn tại và hợp lệ không
  if (!id) {
    return res.status(400).json({
      status: "ERR",
      message: "ID is required.",
    });
  }

  try {
    const result = await UserServices.toggleActiveUser(id);

    // Kiểm tra nếu không tìm thấy đối tượng
    if (!result || result.status === "ERR") {
      console.error("Không tìm thấy user hoặc không thể cập nhật.");
      return res.status(404).json({
        status: "ERR",
        message: "Answer not found or could not be updated.",
      });
    }
    res.status(200).json(result); // Trả về kết quả thành công
  } catch (error) {
    console.error("Lỗi xảy ra trong toggleActiveUser:", error);
    res.status(500).json({
      status: "ERR",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

const filterUsers = async (req, res) => {
  try {
    const { name, phone, email, active } = req.query;

    // Gọi service để lọc người dùng
    const users = await UserServices.filterUsers({
      name,
      phone,
      email,
      active,
    });

    // Trả về kết quả
    return res.status(200).json({
      status: "OK",
      message: "Filtered users successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Error filtering users: ", error);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while filtering users.",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await UserServices.updatePassword(
      userId,
      currentPassword,
      newPassword
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  filterUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  logoutUser,
  viewFollower,
  refreshToken,
  addFollower,
  removeFollower,
  getFollowingUsers,
  getAllUsersExceptSelf,
  updateQuesCount,
  updateAnswerCount,
  toggleActiveUser,
  updatePassword,
};

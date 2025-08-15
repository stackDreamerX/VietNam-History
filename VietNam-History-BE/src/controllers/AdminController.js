const AdminService = require("../services/AdminService");
const JwtService = require("../services/JwtService");
const validator = require("validator");

// Tạo tài khoản admin
const createAdmin = async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      confirmPassword,
      phone,
      img,
      birthday,
      note,
      isAdmin,
      // province,
      // district,
      // commune,
      // gender,
    } = req.body;

    // console.log(req.body);

    // Kiểm tra dữ liệu đầu vào
    if (
      !email ||
      !name ||
      !password ||
      !confirmPassword ||
      !phone ||
      !birthday
      // !province ||
      // !district ||
      // !commune ||
      // !gender
    ) {
      return res.status(400).json({
        status: "ERR",
        message: "All fields are required.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Password and confirm password do not match.",
      });
    }

    const response = await AdminService.createAdmin(req.body);
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Đăng nhập admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, " ", password);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //check email
    const isValidEmail = emailPattern.test(email);

    if (!email || !password) {
      //check have
      return res.status(400).json({
        status: "ERR",
        message: "Email and password are required",
      });
    } else if (!isValidEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    }

    const response = await AdminService.loginAdmin(req.body);
    const { refresh_token, ...newResponse } = response;
    //console.log('response', response);
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
    });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Cập nhật thông tin admin
const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const data = req.body;

    if (!adminId) {
      return res.status(400).json({
        status: "ERR",
        message: "Admin ID is required.",
      });
    }

    const response = await AdminService.updateAdmin(adminId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Xóa tài khoản admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    

    if (!adminId) {
      return res.status(400).json({
        status: "ERR",
        message: "Admin ID is required.",
      });
    }

    const response = await AdminService.deleteAdmin(adminId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Lấy danh sách admin
const getAllAdmin = async (req, res) => {
  try {
    const { limit, page } = req.query;

    const response = await AdminService.getAllAdmin(
      Number(limit),
      Number(page)
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Lấy thông tin chi tiết admin
const getDetailsAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    console.log("ID", adminId)
    if (!adminId) {
      return res.status(400).json({
        status: "ERR",
        message: "Admin ID is required.",
      });
    }

    const response = await AdminService.getDetailsAdmin(adminId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// Refresh token
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

// Đổi mật khẩu admin
const changePasswordAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "New password and confirm password do not match.",
      });
    }

    const response = await AdminService.changePassword(
      adminId,
      currentPassword,
      newPassword
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

// // Kích hoạt/Vô hiệu hóa admin
const toggleAdminStatus = async (req, res) => {
  try {
    const adminId = req.params.id;

    if (!adminId) {
      return res.status(400).json({
        status: "ERR",
        message: "Admin ID is required.",
      });
    }

    const response = await AdminService.toggleAdminStatus(adminId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const filterAdmin = async (req, res) => {
  try {
    const { name, phone, email } = req.query;

    // Gọi service để lọc người dùng
    const admins = await AdminService.filterAdmin({ name, phone, email });

    // Trả về kết quả
    return res.status(200).json({
      status: "OK",
      message: "Filtered users successfully.",
      data: admins,
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

module.exports = {
  filterAdmin,
  createAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdmin,
  getDetailsAdmin,
  refreshToken,
  changePasswordAdmin,
  //toggleAdminStatus,
};

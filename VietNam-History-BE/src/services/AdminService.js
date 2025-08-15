const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");
const { verifyToken } = require("../middleware/authMiddleware");

//tạo Admin
const createAdmin = (newAdmin) => {
  return new Promise(async (resolve, reject) => {
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
    } = newAdmin;
    try {
      //check email created
      const checkAdmin = await Admin.findOne({
        email: email,
      });
      //nếu email đã tồn tại
      if (checkAdmin !== null) {
        return reject({
          status: "ERR",
          message: "The email is already in use",
        });
      }

      if (!password) {
        return reject({
          status: "ERR",
          message: "Password is required",
        });
      }

      //mã hóa password
      const hash = bcrypt.hashSync(password, 10);
      // console.log("hash", hash);
      const createdAdmin = await Admin.create({
        email,
        name,
        password: hash,
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

        // confirmPassword
      });
      if (createdAdmin) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdAdmin,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//log in Admin
const loginAdmin = (adminLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = adminLogin;
    console.log(email, " ", password);

    try {
      // Check if the user exists
      const checkAdmin = await Admin.findOne({ email: email });
      console.log("email: ", email);

      if (!checkAdmin) {
        return reject({
          status: "ERR",
          message: "User not found",
        });
      }

      // Compare passwords
      const comparePassword = bcrypt.compareSync(password, checkAdmin.password);
      if (!comparePassword) {
        return reject({
          status: "ERR",
          message: "Incorrect password",
        });
      }

      const access_token = await generalAccessToken({
        id: checkAdmin.id,
        isAdmin: checkAdmin.isAdmin,
      });

      const refresh_token = await generalRefreshToken({
        id: checkAdmin.id,
        isAdmin: checkAdmin.isAdmin,
      });

      console.log("access_token", access_token);
      ;
      resolve({
        status: "OK",
        message: "Login successful",
        access_token,
        refresh_token,
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      reject({
        status: "ERR",
        message: "Internal Server Error",
      });
    }
  });
};

//update Admin
const updateAdmin = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkAdmin = await Admin.findOne({
        _id: id,
      });
      console.log("checkAdmin", checkAdmin);

      //nếu Admin ko tồn tại
      if (checkAdmin === null) {
        resolve({
          status: "OK",
          message: "The Admin is not defined",
        });
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(id, data, {
        new: true,
      });
      console.log("updatedAdmin", updatedAdmin);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedAdmin,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete Admin
const deleteAdmin = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkAdmin = await Admin.findOne({
        _id: id,
      });
      //console.log("checkAdmin", checkAdmin);

      //nếu Admin ko tồn tại
      if (checkAdmin === null) {
        resolve({
          status: "OK",
          message: "The Admin is not defined",
        });
      }

      await Admin.findByIdAndDelete(id);
      //console.log("updatedAdmin", updatedAdmin);
      resolve({
        status: "OK",
        message: "DELETE Admin IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get info Admin
const getAllAdmin = (limit = 4, page = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalAdmin = await Admin.countDocuments();
      const allAdmin = await Admin.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all Admin IS SUCCESS",
        data: allAdmin,
        total: totalAdmin,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalAdmin / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get details Admin
const getDetailsAdmin = (id) => {
  console.log("ID truyền vào service:", id);

  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const admin = await Admin.findOne({
        _id: id,
      });

      //nếu Admin ko tồn tại
      if (admin === null) {
        resolve({
          status: "OK",
          message: "The Admin is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: admin,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Đổi mật khẩu Admin
const changePasswordAdmin = (id, oldPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return resolve({
          status: "ERR",
          message: "Admin not found",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        admin.password
      );
      if (!isPasswordCorrect) {
        return resolve({
          status: "ERR",
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedPassword;
      await admin.save();

      resolve({
        status: "OK",
        message: "Password updated successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Kích hoạt/Vô hiệu hóa Admin
const toggleAdminStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return resolve({
          status: "ERR",
          message: "Admin not found",
        });
      }

      admin.isActive = !admin.isActive;
      await admin.save();

      resolve({
        status: "OK",
        message: "Admin status updated successfully",
        isActive: admin.isActive,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Làm mới token
const refreshToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded = verifyToken(token);

      if (!decoded) {
        return resolve({
          status: "ERR",
          message: "Invalid refresh token",
        });
      }

      const newAccessToken = await generalAccessToken({
        id: decoded.id,
        isAdmin: decoded.isAdmin,
      });

      resolve({
        status: "OK",
        message: "Token refreshed successfully",
        access_token: newAccessToken,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const filterAdmin = async (filters) => {
  const query = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" }; // Tìm kiếm tên không phân biệt hoa thường
  }
  if (filters.phone) {
    query.phone = { $regex: filters.phone, $options: "i" }; // Tìm kiếm số điện thoại
  }
  if (filters.email) {
    query.email = { $regex: filters.email, $options: "i" }; // Tìm kiếm email
  }

  // Truy vấn dữ liệu từ database
  const admins = await Admin.find(query);
  return admins;
};

//tạo access token dựa vào refresh token

module.exports = {
  filterAdmin,
  createAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdmin,
  getDetailsAdmin,
  changePasswordAdmin,
  toggleAdminStatus,
  refreshToken,
};

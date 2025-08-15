const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

//tạo user
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone, birthday } = newUser;
    try {
      //check email created
      const checkUser = await User.findOne({
        email: email,
      });
      //nếu email đã tồn tại
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "The email is already",
        });
      }
      //mã hóa password
      const hash = bcrypt.hashSync(password, 10);
      console.log("hash", hash);

      const createdUser = await User.create({
        name,
        email,
        password: hash,
        confirmPassword: hash,
        phone,
        birthday,
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

//log in user
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      //check email created
      const checkUser = await User.findOne({
        email: email,
      });
      //nếu email đã tồn tại
      if (checkUser === null) {
        return reject({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      console.log("comparePassword ", comparePassword);

      if (!comparePassword) {
        return reject({
          status: "ERR",
          message: "The password or user is incorrect",
        });
      }

      const access_token = await generalAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      console.log("access_token ", access_token);

      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//update user
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkUser = await User.findOne({
        _id: id,
      });
      // console.log("checkUser", checkUser);

      //nếu user ko tồn tại
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      // console.log("updatedUser", updatedUser);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//delete user
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const checkUser = await User.findOne({
        _id: id,
      });
      console.log("checkUser", checkUser);

      //nếu user ko tồn tại
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      await User.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "DELETE USER IS SUCCESS",
      });
    } catch (e) {
      reject(e);
    }
  });
};

//get info user
const getAllUser = (limit = 4, page = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalUser = await User.countDocuments();
      const allUser = await User.find()
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "OK",
        message: "Get all USER IS SUCCESS",
        data: allUser,
        total: totalUser,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalUser / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUsersExceptSelf = async (currentUserId) => {
  try {
    // Lọc người dùng trừ bản thân
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("name img address followerCount") // Chỉ lấy các trường cần thiết
      .lean(); // Chuyển đổi sang đối tượng JS
    return users;
  } catch (error) {
    throw new Error("Unable to fetch users: " + error.message);
  }
};

//get details user
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email created
      const user = await User.findOne({
        _id: id,
      });

      //nếu user ko tồn tại
      if (user === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};

//view follower
const viewFollower = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm user dựa trên ID
      const user = await User.findOne({ _id: id }).populate("followers"); // Populate thêm danh sách followers

      // Nếu user không tồn tại
      if (!user) {
        return resolve({
          status: "ERR",
          message: "The user does not exist",
        });
      }

      // Trả về danh sách followers
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: user.followers, // Trả về danh sách followers
      });
    } catch (e) {
      reject(e);
    }
  });
};

//add follower
const addFollower = async (currentUserId, userIdToFollow) => {
  if (!currentUserId || !userIdToFollow) {
    throw new Error("Both currentUserId and userIdToFollow are required");
  }

  if (currentUserId === userIdToFollow) {
    throw new Error("You cannot follow yourself");
  }

  const currentUser = await User.findById(currentUserId);
  const userToFollow = await User.findById(userIdToFollow);

  if (!currentUser || !userToFollow) {
    throw new Error("User not found");
  }

  // Check if already following by comparing string values of ObjectIDs
  const isAlreadyFollowing = currentUser.following.some(
    id => id.toString() === userIdToFollow
  );

  if (isAlreadyFollowing) {
    throw new Error("You are already following this user");
  }

  // Cập nhật danh sách following và followers
  currentUser.following.push(userIdToFollow);
  userToFollow.followers.push(currentUserId);

  // Tăng followerCount và followingCount
  currentUser.followingCount += 1;
  userToFollow.followerCount += 1;

  // Lưu thay đổi
  await currentUser.save();
  await userToFollow.save();

  return {
    currentUserId: currentUser.id,
    following: currentUser.following,
    followerCount: userToFollow.followerCount,
  };
};

const removeFollower = async (currentUserId, userIdToUnfollow) => {
  if (!currentUserId || !userIdToUnfollow) {
    throw new Error("Both currentUserId and userIdToUnfollow are required");
  }

  if (currentUserId === userIdToUnfollow) {
    throw new Error("You cannot unfollow yourself");
  }

  const currentUser = await User.findById(currentUserId);
  const userToUnfollow = await User.findById(userIdToUnfollow);

  if (!currentUser || !userToUnfollow) {
    throw new Error("User not found");
  }

  // Check if following by comparing string values of ObjectIDs
  const isFollowing = currentUser.following.some(
    id => id.toString() === userIdToUnfollow
  );

  if (!isFollowing) {
    throw new Error("You are not following this user");
  }

  // Cập nhật danh sách following và followers
  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== userIdToUnfollow
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (id) => id.toString() !== currentUserId
  );

  // Giảm followerCount và followingCount
  currentUser.followingCount -= 1;
  userToUnfollow.followerCount -= 1;

  // Lưu thay đổi
  await currentUser.save();
  await userToUnfollow.save();

  return {
    currentUserId: currentUser.id,
    following: currentUser.following,
    followerCount: userToUnfollow.followerCount,
  };
};

const getFollowingUsers = async (userId) => {
  const currentUser = await User.findById(userId).populate("following");

  if (!currentUser) {
    throw new Error("User  not found");
  }

  return currentUser.following; // Trả về danh sách user mà user hiện tại đang follow
};

const updateQuesCount = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }
    user.quesCount = (user.quesCount || 0) + 1; // Nếu `quesCount` chưa được khởi tạo thì set về 0
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const updateAnswerCount = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }
    user.answerCount = (user.answerCount || 0) + 1; // Nếu `quesCount` chưa được khởi tạo thì set về 0
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

//tạo access token dựa vào refresh token

//Update active cua user
const toggleActiveUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    user.active = !user.active;
    await user.save();

    return {
      status: "OK",
      message: "SUCCESS",
      data: user,
    };
  } catch (error) {
    throw new Error(error.message || "An error occurred");
  }
};

const filterUsers = async (filters) => {
  const query = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.phone) {
    query.phone = { $regex: filters.phone, $options: "i" };
  }
  if (filters.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }

  if (typeof active !== "undefined") {
    query.active = active;
  }

  // Truy vấn dữ liệu từ database
  const users = await User.find(query);
  return users;
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    console.log("userId:", userId);
    console.log("currentPassword:", currentPassword);
    console.log("newPassword:", newPassword);

    if (!userId || !currentPassword || !newPassword) {
      return {
        status: "ERR",
        message: "Missing required parameters",
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        status: "ERR",
        message: "User not found",
      };
    }

    if (!user.password) {
      return {
        status: "ERR",
        message: "User has no password set",
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return {
        status: "ERR",
        message: "Current password is incorrect",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      status: "OK",
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      status: "ERR",
      message: error.message || "Failed to update password",
    };
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
  viewFollower,
  addFollower,
  removeFollower,
  getFollowingUsers,
  getAllUsersExceptSelf,
  updateQuesCount,
  updateAnswerCount,
  toggleActiveUser,
  updatePassword,
};

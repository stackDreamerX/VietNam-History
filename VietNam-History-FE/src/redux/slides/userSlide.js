import { createSlice } from "@reduxjs/toolkit";
import { floatButtonPrefixCls } from "antd/es/float-button/FloatButton";

const initialState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  birthday: "",
  img: "",
  note: "",
  facebookLink: "",
  githubLink: "",
  address: "",
  gender: "",
  password: "",

  followerCount: 0,
  followingCount: 0,
  answerCount: 0,
  quesCount: 0,
  reportCount: "",
  savedCount: "",
  reputation: "",
  access_token: "",
  answerCount: 0,
  quesCount: 0,
  allUser: [], // Danh sách tất cả các user
  detailUser: {},
  allUsersExceptSelf: [], // Danh sách tất cả user trừ user hiện tại
  followers: [],
  following: [],
  createdAt: "",
  active: true,
};

export const userSlide = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        _id = "",
        name = "",
        email = "",
        phone = "",
        birthday = "",
        img = "",
        note = "",
        facebookLink = "",
        githubLink = "",
        address = "",
        gender = "",
        password = "",
        followerCount = 0,
        followingCount = 0,
        followers = [],
        following = [],
        answerCount = 0,
        quesCount = 0,
        reportCount = "",
        savedCount = "",
        reputation = "",
        access_token,
        createdAt = "",
        active = true,
      } = action.payload;

      state.name = name || email;
      state.email = email;
      state.phone = phone;
      state.birthday = birthday;
      state.img = img;
      state.note = note;
      state.facebookLink = facebookLink;
      state.githubLink = githubLink;
      state.address = address;
      state.gender = gender;
      state.password = password;
      state.followingCount = followingCount;
      state.followerCount = followerCount;
      state.followers = followers;
      state.following = following;
      state.answerCount = answerCount;
      state.quesCount = quesCount;
      state.reportCount = reportCount;
      state.savedCount = savedCount;
      state.reputation = reputation;
      state.access_token = access_token;
      state.id = _id;
      state.createdAt = createdAt;
      state.active = active;
    },
    resetUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.phone = "";
      state.birthday = "";
      state.img = "";
      state.note = "";
      state.facebookLink = "";
      state.githubLink = "";
      state.address = "";
      state.gender = "";
      state.password = "";
      state.followerCount = 0;
      state.followingCount = 0;
      state.answerCount = 0;
      state.quesCount = 0;
      state.access_token = "";
      state.reportCount = "";
      state.savedCount = "";
      state.reputation = "";
      state.createdAt = "";
      state.active = true;
    },
    setAllUser: (state, action) => {
      state.allUser = action.payload; // Lưu danh sách Question từ API
    },
    setDetailUser: (state, action) => {
      state.detailUser = action.payload;
    },
    setAllUsersExceptSelf: (state, action) => {
      state.allUsersExceptSelf = action.payload;
    },
    addFollow: (state, action) => {
      state.followers.push(action.payload); // Thêm người theo dõi vào danh sách
    },
    setFollowStatus: (state, action) => {
      const { userId, isFollowed, followerCount } = action.payload;

      // Cập nhật danh sách user
      state.allUser = state.allUser.map((user) =>
        user._id === userId ? { ...user, followerCount } : user
      );

      // Đảm bảo `following` luôn là mảng
      state.following = Array.isArray(state.following) ? state.following : [];

      // Cập nhật danh sách following
      state.following = isFollowed
        ? [...state.following, userId]
        : state.following.filter((id) => id !== userId);
    },

    // Thêm action để cập nhật danh sách following
    setFollowing: (state, action) => {
      state.following = action.payload; // Lưu danh sách user đang follow
    },
  },
});

export const {
  updateUser,
  resetUser,
  setDetailUser,
  setAllUser,
  setAllUsersExceptSelf,
  addFollow,
  setFollowStatus,
  setFollowing,
} = userSlide.actions;

export default userSlide.reducer;

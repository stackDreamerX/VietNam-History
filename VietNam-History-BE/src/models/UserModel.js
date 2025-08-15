const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    birthday: { type: Date, required: true },
    img: { type: String, default: "" }, // Mặc định là chuỗi rỗng
    note: { type: String, default: "" }, // Mặc định là chuỗi rỗng
    facebookLink: { type: String, default: "" },
    githubLink: { type: String, default: "" },
    reportCount: { type: Number, default: 0 }, // Mặc định là 0
    followerCount: { type: Number, default: 0 }, // Mặc định là 0
    followingCount: { type: Number, default: 0 }, // Mặc định là 0
    savedCount: { type: Number, default: 0 }, // Mặc định là 0
    reputation: { type: Number, default: 0 }, // Mặc định là 0
    active: { type: Boolean, default: true }, // Mặc định là true
    isAdmin: { type: Boolean, default: false },
    answerCount: { type: Number, default: 0 },
    quesCount: { type: Number, default: 0 },

    // Khóa ngoại (có thể bỏ qua hoặc thêm giá trị mặc định)
    reputationType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReputationType",
      required: false,
    },
    address: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Province",
      // required: false,
      type: String,
      default: "",
      required: false,
    },
    gender: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Gender",
      // required: false,
      type: String,
      default: "",
      required: false,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết đến User khác
      },
    ], // Danh sách ID của người theo dõi
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết đến User khác
      },
    ], // Danh sách ID của người mà user đang theo dõi
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

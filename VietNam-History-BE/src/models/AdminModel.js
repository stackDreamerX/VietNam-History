//lưu admin
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    img: { type: String, required: false, default:"" },
    birthday: { type: Date, required: true },
    note: { type: String, required: false }, //textbox 'about me'
    isAdmin: { type: Boolean, required: true, default: false },
    //khóa ngoại
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: false,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: false,
    },
    commune: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commune",
      required: false,
    },
    // gender: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Gender",
    //   required: false,
    // },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;

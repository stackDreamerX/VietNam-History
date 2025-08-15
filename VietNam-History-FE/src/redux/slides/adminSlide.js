import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  birthday: "",
  img: "",
  note: "",
  address: "",
  gender: "",
  password: "",
  isAdmin: false,
  access_token: "",
  allAdmin: [], // Danh sách tất cả các Admin
  detailAdmin: {},
};

export const adminSlide = createSlice({
  name: "Admin",
  initialState,
  reducers: {
    updateAdmin: (state, action) => {
      const {
        _id = "",
        name = "",
        email = "",
        phone = "",
        birthday = "",
        img = "",
        note = "",
        address = "",
        gender = "",
        password = "",
        isAdmin = false,
        access_token,
      } = action.payload;

      state.name = name || email;
      state.email = email;
      state.phone = phone;
      state.birthday = birthday;
      state.img = img;
      state.note = note;
      state.address = address;
      state.gender = gender;
      state.password = password;
      state.access_token = access_token;
      state.id = _id;
      state.isAdmin = isAdmin;
    },
    resetAdmin: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.phone = "";
      state.birthday = "";
      state.img = "";
      state.note = "";
      state.address = "";
      state.gender = "";
      state.password = "";
      state.access_token = "";
      state.isAdmin = false;
    },
    setAllAdmin: (state, action) => {
      state.allAdmin = action.payload; // Lưu danh sách Question từ API
    },
    setDetailAdmin: (state, action) => {
      state.detailAdmin = action.payload;
    },
  },
});

export const { updateAdmin, resetAdmin, setDetailAdmin, setAllAdmin } =
  adminSlide.actions;

export default adminSlide.reducer;

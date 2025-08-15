import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  question: "",
  user: "",
  allSaved: JSON.parse(localStorage.getItem("allSaved")) || [], // Danh sách tất cả bài viết được lưu
  detailSaved: {}, // Chi tiết một bài lưu cụ thể
};

export const savedSlide = createSlice({
  name: "saved",
  initialState,
  reducers: {
    updateSaved: (state, action) => {
      const { _id = "", question = "", user = "" } = action.payload;

      state.id = _id;
      state.question = question;
      state.user = user;
    },
    resetSaved: (state) => {
      state.id = "";
      state.question = "";
      state.user = "";
    },
    setAllSaved: (state, action) => {
      state.allSaved = action.payload; // Lưu danh sách các bài viết được lưu từ API
      localStorage.setItem("allSaved", JSON.stringify(state.allSaved));
    },
    setDetailSaved: (state, action) => {
      state.detailSaved = action.payload; // Lưu chi tiết một bài viết được lưu
    },
  },
});

// Export các actions
export const { updateSaved, resetSaved, setAllSaved, setDetailSaved } =
  savedSlide.actions;

// Export reducer
export default savedSlide.reducer;

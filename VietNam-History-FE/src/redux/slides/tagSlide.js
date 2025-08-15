import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  name: "",
  description: "",
  usedCount: 0,
  userTag: "",
  access_token: "",
  allTag: [], // Danh sách tất cả các Tag
  detailTag: {
    // id: "",
    // title: "",
    // content: "",
    // note: "",
    // upVoteCount: 0,
    // downVoteCount: 0,
    // answerCount: 0,
    // view: 0,
    // reportCount: 0,
    // active: true,
    // userQues: null,
    // images: [],
    // tags: [],
    // createdAt: "",
  }, // Chi tiết một Tag cụ thể
};

export const tagSlide = createSlice({
  name: "tag",
  initialState,
  reducers: {
    updateTag: (state, action) => {
      const {
        _id = "",
        name = "",
        description = "",
        usedCount = 0,
        userTag = "",
        access_token,
      } = action.payload;

      state.name = name;
      state.description = description;
      state.usedCount = usedCount;
      state.userTag = userTag;
      state.access_token = access_token;
      state.id = _id;
    },
    resetTag: (state) => {
      state.id = "";
      state.name = "";
      state.description = "";
      state.usedCount = 0;
      state.userTag = "";
      state.access_token = "";
    },
    setAllTag: (state, action) => {
      state.allTag = action.payload; // Lưu danh sách Tag từ API
    },
    setDetailTag: (state, action) => {
      state.detailTag = action.payload;
      // const payload = action.payload || {};
      // state.detailTag = {
      //   id: payload.id || "",
      //   title: payload.title || "",
      //   content: payload.content || "",
      //   note: payload.note || "",
      //   upVoteCount: payload.upVoteCount || 0,
      //   downVoteCount: payload.downVoteCount || 0,
      //   answerCount: payload.answerCount || 0,
      //   view: payload.view || 0,
      //   reportCount: payload.reportCount || 0,
      //   active: payload.active ?? true,
      //   userQues: payload.userQues || null,
      //   images: payload.images || [],
      //   tags: payload.tags || [],
      //   createdAt: payload.createdAt || "",
      // };
    }, // Lưu chi tiết một Tag từ API
  },
});

export const { updateTag, resetTag, setAllTag, setDetailTag } =
  tagSlide.actions;

export default tagSlide.reducer;

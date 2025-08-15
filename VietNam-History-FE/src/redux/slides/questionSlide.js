import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  title: "",
  content: "",
  note: "",
  upVoteCount: 0,
  downVoteCount: 0,
  answerCount: 0,
  view: 0,
  reportCount: 0,
  active: true,
  userQues: "",
  images: [],
  tags: [],
  access_token: "",
  allQuestion: [], // Danh sách tất cả các Question
  detailQuestion: {
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
  }, // Chi tiết một Question cụ thể
  detailAsker: {},
};

export const questionSlide = createSlice({
  name: "question",
  initialState,
  reducers: {
    updateQuestion: (state, action) => {
      const {
        _id = "",
        title = "",
        content = "",
        note = "",
        upVoteCount = 0,
        downVoteCount = 0,
        answerCount = 0,
        view = 0,
        reportCount = 0,
        active = true,
        userQues = "",
        images = [],
        tags = [],
        access_token,
      } = action.payload;

      state.title = title;
      state.content = content;
      state.note = note;
      state.upVoteCount = upVoteCount;
      state.downVoteCount = downVoteCount;
      state.answerCount = answerCount;
      state.view = view;
      state.reportCount = reportCount;
      state.active = active;
      state.userQues = userQues;
      state.images = images;
      state.tags = tags;
      state.access_token = access_token;
      state.id = _id;
    },
    resetQuestion: (state) => {
      state.id = "";
      state.title = "";
      state.content = "";
      state.note = "";
      state.upVoteCount = 0;
      state.downVoteCount = 0;
      state.answerCount = 0;
      state.view = 0;
      state.reportCount = 0;
      state.active = 0;
      state.userQues = "";
      state.images = [];
      state.tags = [];
      state.access_token = "";
    },
    setAllQuestion: (state, action) => {
      state.allQuestion = action.payload; // Lưu danh sách Question từ API
    },
    setDetailQuestion: (state, action) => {
      state.detailQuestion = action.payload;
      // const payload = action.payload || {};
      // state.detailQuestion = {
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
    }, // Lưu chi tiết một Question từ API
    setDetailAsker: (state, action) => {
      state.detailAsker = action.payload;
    },
  },
});

export const {
  updateQuestion,
  resetQuestion,
  setAllQuestion,
  setDetailQuestion,
  setDetailAsker,
} = questionSlide.actions;

export default questionSlide.reducer;

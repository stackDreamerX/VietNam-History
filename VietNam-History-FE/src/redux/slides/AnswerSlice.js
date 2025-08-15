// redux/slides/answerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  answers: [],
  answerCount: 0,
};

const answerSlice = createSlice({
  name: "answer",
  initialState,
  reducers: {
    setAnswers(state, action) {
      state.answers = action.payload;
    },
    addAnswer(state, action) {
      state.answers.push(action.payload);
      state.answerCount += 1; // Tăng số lượng câu trả lời
    },
    clearAnswers(state) {
      state.answers = [];
      state.answerCount = 0; // Đặt lại số lượng câu trả lời
    },
  },
});

export const { setAnswers, addAnswer, clearAnswers } = answerSlice.actions;

export default answerSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slides/counterSlide";
import userReducer from "./slides/userSlide";
import adminReducer from "./slides/adminSlide";
import questionReducer from "./slides/questionSlide";
import tagReducer from "./slides/tagSlide";
import answerReducer from "./slides/AnswerSlice";
import savedReducer from "./slides/savedSlide";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    admin: adminReducer,
    question: questionReducer,
    tag: tagReducer,
    answer: answerReducer,
    saved: savedReducer,
  },
});

//chứa tất cả router của API
const UserRouter = require("./UserRouter");
const TagRouter = require("./TagRouter");
const AdminRouter = require("./AdminRouter");
const QuestionRouter = require("./QuestionRouter");
const QuestionVoteRouter = require("./QuestionVoteRouter");
const QuestionReportRouter = require("./QuestionReportRouter");
const CommentReportRouter = require("./CommentReportRouter");
const AnswerReportRouter = require("./AnswerReportRouter");
const Answer = require("./AnswerRouter");
const AnswerVoteRouter = require("./AnswerVoteRouter");
const Saved = require("./SavedRouter");
const CommentRouter = require("./CommentRouter");
const NotificationRouter = require("./NotificationRouter");
const QuizRouter = require("./QuizRouter");
const ChatbotRouter = require("./ChatbotRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/tag", TagRouter);
  app.use("/api/admin", AdminRouter);
  app.use("/api/question", QuestionRouter);
  app.use("/api/answer", Answer);
  app.use("/api/saved", Saved);
  app.use("/api/answer", Answer);
  app.use("/api/comment", CommentRouter);
  app.use("/api/question-vote", QuestionVoteRouter);
  app.use("/api/question-report", QuestionReportRouter);
  app.use("/api/answer-report", AnswerReportRouter);
  app.use("/api/comment-report", CommentReportRouter);
  app.use("/api/answer-vote", AnswerVoteRouter);
  app.use("/api/notification", NotificationRouter);
  app.use("/api/quiz", QuizRouter);
  app.use("/api/chatbot", ChatbotRouter);
};

module.exports = routes;

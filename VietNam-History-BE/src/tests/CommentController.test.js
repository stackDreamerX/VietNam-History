const CommentService = require("../services/CommentService");
const {
  createComment,
  updateComment,
  deleteComment,
  getDetailsComment,
  getAllComment,
  getCommentsByAnswer,
  getCommentsByQuestion,
  getCommentsByUser,
} = require("../controllers/CommentController");

jest.mock("../services/CommentService", () => ({
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
  getDetailsComment: jest.fn(),
  getAllComment: jest.fn(),
  getCommentsByAnswer: jest.fn(),
  getCommentsByQuestion: jest.fn(),
  getCommentsByUser: jest.fn(),
}));


describe("CommentController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ======= createComment =======
  describe("createComment", () => {
    it("should return error if required fields missing", async () => {
      mockReq = { body: { content: "", user: "" } };

      await createComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "The input is required",
      });
    });

    it("should create comment successfully", async () => {
      mockReq = {
        body: { content: "abc", user: "user1", answer: "ans1", question: "q1" },
      };

      const mockResponse = { status: "OK", data: { id: "c1" } };
      CommentService.createComment.mockResolvedValue(mockResponse);

      await createComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 404 if service throws error", async () => {
      mockReq = { body: { content: "abc", user: "user1" } };
      CommentService.createComment.mockRejectedValue(new Error("Fail"));

      await createComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(Error),
      });
    });
  });

  // ======= updateComment =======
  describe("updateComment", () => {
    it("should update comment successfully", async () => {
      mockReq = { params: { id: "c1" }, body: { content: "updated" } };
      const mockResponse = { status: "OK" };
      CommentService.updateComment.mockResolvedValue(mockResponse);

      await updateComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { id: "c1" }, body: {} };
      CommentService.updateComment.mockRejectedValue(new Error("Fail"));

      await updateComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });

  // ======= deleteComment =======
  describe("deleteComment", () => {
    it("should delete comment successfully", async () => {
      mockReq = { params: { id: "c1" } };
      const mockResponse = { status: "OK" };
      CommentService.deleteComment.mockResolvedValue(mockResponse);

      await deleteComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { id: "c1" } };
      CommentService.deleteComment.mockRejectedValue(new Error("Fail"));

      await deleteComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });

  // ======= getDetailsComment =======
  describe("getDetailsComment", () => {
    it("should get details successfully", async () => {
      mockReq = { params: { id: "c1" } };
      const mockResponse = { status: "OK", data: { id: "c1" } };
      CommentService.getDetailsComment.mockResolvedValue(mockResponse);

      await getDetailsComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { id: "c1" } };
      CommentService.getDetailsComment.mockRejectedValue(new Error("Fail"));

      await getDetailsComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });

  // ======= getAllComment =======
  describe("getAllComment", () => {
    it("should get all comments successfully", async () => {
      mockReq = { params: { postId: "p1" } };
      const mockResponse = { status: "OK", data: [] };
      CommentService.getAllComment.mockResolvedValue(mockResponse);

      await getAllComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { postId: "p1" } };
      CommentService.getAllComment.mockRejectedValue(new Error("Fail"));

      await getAllComment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });

  // ======= getCommentsByAnswer =======
  describe("getCommentsByAnswer", () => {
    it("should get comments by answerId successfully", async () => {
      mockReq = { params: { answerId: "a1" } };
      const mockResponse = { status: "OK", data: [] };
      CommentService.getCommentsByAnswer.mockResolvedValue(mockResponse);

      await getCommentsByAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

  });

  // ======= getCommentsByQuestion =======
  describe("getCommentsByQuestion", () => {
    it("should get comments by questionId successfully", async () => {
      mockReq = { params: { questionId: "q1" } };
      const mockResponse = { status: "OK", data: [] };
      CommentService.getCommentsByQuestion.mockResolvedValue(mockResponse);

      await getCommentsByQuestion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { questionId: "q1" } };
      CommentService.getCommentsByQuestion.mockRejectedValue(new Error("Fail"));

      await getCommentsByQuestion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });

  // ======= getCommentsByUser =======
  describe("getCommentsByUser", () => {
    it("should get comments by userId successfully", async () => {
      mockReq = { params: { userId: "u1" } };
      const mockResponse = { status: "OK", data: [] };
      CommentService.getCommentsByUser.mockResolvedValue(mockResponse);

      await getCommentsByUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 500 if service throws error", async () => {
      mockReq = { params: { userId: "u1" } };
      CommentService.getCommentsByUser.mockRejectedValue(new Error("Fail"));

      await getCommentsByUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "Fail",
      });
    });
  });
});

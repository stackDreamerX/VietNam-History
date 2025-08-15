const AnswerService = require("../services/AnswerService");
const {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  getDetailsAnswer,
  getAllAnswer,
  getAnswersByQuestionId,
  getAnswersByQuestionIdAdmin,
  getAnswersByUserId,
  getStatisticByUser,
  toggleActiveAns,
  addVote,
} = require("../controllers/AnswerController");

jest.mock("../services/AnswerService");

describe("AnswerController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ==================== CREATE ANSWER ====================
  describe("createAnswer", () => {
    it("should return error if required fields are missing", async () => {
      // Test khi thiếu dữ liệu bắt buộc (content, userAns, question)
      mockReq = { body: { content: "", userAns: "", question: "" } };

      await createAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ERR",
        message: "The input is required",
      });
    });

    it("should create answer successfully", async () => {
      // Test tạo câu trả lời thành công với dữ liệu hợp lệ
      mockReq = {
        body: {
          content: "Answer content",
          userAns: "user123",
          question: "question123",
        },
      };

      const mockResponse = { status: "OK", message: "Created", data: {} };
      AnswerService.createAnswer.mockResolvedValue(mockResponse);

      await createAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  // ==================== DELETE ANSWER ====================
  describe("deleteAnswer", () => {
    it("should return error if no id is provided", async () => {
      // Test khi không truyền id trong params
      mockReq = { params: {} };

      await deleteAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return not found if answer not exists", async () => {
      // Test xóa câu trả lời không tồn tại (service trả về lỗi)
      mockReq = { params: { id: "not-exist-id" } };
      AnswerService.deleteAnswer.mockResolvedValue({ status: "ERR" });

      await deleteAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should delete answer successfully", async () => {
      // Test xóa câu trả lời thành công
      mockReq = { params: { id: "exist-id" } };
      AnswerService.deleteAnswer.mockResolvedValue({ status: "OK", message: "Deleted" });

      await deleteAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET DETAILS ANSWER ====================
  describe("getDetailsAnswer", () => {
    it("should return error if no id", async () => {
      // Test lấy chi tiết khi không truyền id (có thể trả về lỗi hoặc kết quả mặc định)
      mockReq = { params: {} };

      await getDetailsAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should get details successfully", async () => {
      // Test lấy chi tiết câu trả lời thành công
      mockReq = { params: { id: "123" } };
      AnswerService.getDetailsAnswer.mockResolvedValue({ status: "OK" });

      await getDetailsAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET ALL ANSWERS ====================
  describe("getAllAnswer", () => {
    it("should return all answers", async () => {
      // Test lấy tất cả câu trả lời thành công
      mockReq = { query: {} };
      AnswerService.getAllAnswer.mockResolvedValue({ status: "OK", data: [] });

      await getAllAnswer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET ANSWERS BY QUESTION ID ====================
  describe("getAnswersByQuestionId", () => {
    it("should return answers by questionId", async () => {
      // Test lấy câu trả lời theo questionId thành công
      mockReq = { params: { questionId: "q1" } };
      AnswerService.getAnswersByQuestionId.mockResolvedValue([]);

      await getAnswersByQuestionId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET ANSWERS BY QUESTION ID ADMIN ====================
  describe("getAnswersByQuestionIdAdmin", () => {
    it("should return answers by questionId for admin", async () => {
      // Test lấy câu trả lời theo questionId dành cho admin
      mockReq = { params: { questionId: "q1" } };
      AnswerService.getAnswersByQuestionIdAdmin.mockResolvedValue([]);

      await getAnswersByQuestionIdAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET STATISTICS ====================
  describe("getStatisticByUser", () => {
    it("should return error if missing query params", async () => {
      // Test khi thiếu tham số truy vấn bắt buộc (userAns, year, month)
      mockReq = { query: {} };

      await getStatisticByUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return statistics successfully", async () => {
      // Test lấy thống kê thành công với tham số đầy đủ
      mockReq = { query: { userAns: "u1", year: "2024", month: "5" } };
      AnswerService.getStatisticByUser.mockResolvedValue({ status: "OK" });

      await getStatisticByUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== TOGGLE ACTIVE ====================
  describe("toggleActiveAns", () => {
    it("should return error if missing id", async () => {
      // Test toggle active khi không truyền id
      mockReq = { params: {} };

      await toggleActiveAns(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return not found if answer not updated", async () => {
      // Test khi toggle không thành công (service trả về lỗi)
      mockReq = { params: { id: "invalid" } };
      AnswerService.toggleActiveAns.mockResolvedValue({ status: "ERR" });

      await toggleActiveAns(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should toggle active status", async () => {
      // Test toggle active thành công
      mockReq = { params: { id: "valid" } };
      AnswerService.toggleActiveAns.mockResolvedValue({ status: "OK" });

      await toggleActiveAns(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== ADD VOTE ====================
  describe("addVote", () => {
    it("should return error if input missing", async () => {
      // Test thêm vote khi thiếu input cần thiết
      mockReq = { body: { answerId: "", userId: "", isUpVote: null } };

      await addVote(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return fail status from service", async () => {
      // Test khi service trả về trạng thái thất bại khi thêm vote
      mockReq = { body: { answerId: "a1", userId: "u1", isUpVote: true } };
      AnswerService.addVote.mockResolvedValue({ status: "FAIL" });

      await addVote(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should add vote successfully", async () => {
      // Test thêm vote thành công
      mockReq = { body: { answerId: "a1", userId: "u1", isUpVote: false } };
      AnswerService.addVote.mockResolvedValue({ status: "OK" });

      await addVote(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==================== GET ANSWERS BY USER ====================
  describe("getAnswersByUserId", () => {
    it("should return error if userId missing", async () => {
      // Test khi thiếu userId trong params
      mockReq = { params: {} };

      await getAnswersByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

   it("should return 404 if no answers", async () => {
  mockReq = { params: { userId: "no-ans" }, query: {} }; // thêm query rỗng
  AnswerService.getAnswerByUserId.mockResolvedValue([]);

  await getAnswersByUserId(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(404);
});


    it("should return answers for user", async () => {
      // Test trả về danh sách câu trả lời cho user thành công
      mockReq = { params: { userId: "u1" }, query: { limit: "5", page: "0" } };
      AnswerService.getAnswerByUserId.mockResolvedValue([{ id: "a1" }]);

      await getAnswersByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});

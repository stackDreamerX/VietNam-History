const AnswerVoteController = require("../controllers/AnswerVoteController");
const AnswerVoteService = require("../services/AnswerVoteService");

// Mock response object helper
function createRes() {
  return {
    statusCode: null,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
}

describe("AnswerVoteController tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ===== getVotesByAnswer =====
  describe("getVotesByAnswer", () => {
    test("should return error if answerId missing", async () => {
      const req = { params: {} };
      const res = createRes();

      await AnswerVoteController.getVotesByAnswer(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        status: "ERR",
        message: "The answerId is required",
      });
    });

    test("should return votes list if answerId provided", async () => {
      const req = { params: { answerId: "123" } };
      const res = createRes();
      const fakeResponse = { votes: [1, 2, 3] };

      // Mock service method
      jest.spyOn(AnswerVoteService, "getVotesByAnswer").mockResolvedValue(fakeResponse);

      await AnswerVoteController.getVotesByAnswer(req, res);

      expect(AnswerVoteService.getVotesByAnswer).toHaveBeenCalledWith("123");
      expect(res.statusCode).toBe(200);
      expect(res.data).toBe(fakeResponse);
    });

    test("should return 404 if service throws error", async () => {
      const req = { params: { answerId: "123" } };
      const res = createRes();
      const errorMsg = "Service failure";

      jest.spyOn(AnswerVoteService, "getVotesByAnswer").mockRejectedValue(errorMsg);

      await AnswerVoteController.getVotesByAnswer(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toEqual({ message: errorMsg });
    });
  });

  // ===== checkVoteStatus =====
  describe("checkVoteStatus", () => {
    test("should return error if userId or answerId missing", async () => {
      const res = createRes();

      await AnswerVoteController.checkVoteStatus({ params: {} }, res);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        status: "ERR",
        message: "The userId and answerId are required",
      });

      await AnswerVoteController.checkVoteStatus({ params: { userId: "u1" } }, res);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        status: "ERR",
        message: "The userId and answerId are required",
      });
    });

    test("should return vote status if params provided", async () => {
      const req = { params: { userId: "u1", answerId: "a1" } };
      const res = createRes();
      const fakeResponse = { voted: true };

      jest.spyOn(AnswerVoteService, "checkVoteStatus").mockResolvedValue(fakeResponse);

      await AnswerVoteController.checkVoteStatus(req, res);

      expect(AnswerVoteService.checkVoteStatus).toHaveBeenCalledWith("u1", "a1");
      expect(res.statusCode).toBe(200);
      expect(res.data).toBe(fakeResponse);
    });

    test("should return 404 if service throws error", async () => {
      const req = { params: { userId: "u1", answerId: "a1" } };
      const res = createRes();
      const errorMsg = "Service error";

      jest.spyOn(AnswerVoteService, "checkVoteStatus").mockRejectedValue(errorMsg);

      await AnswerVoteController.checkVoteStatus(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toEqual({ message: errorMsg });
    });
  });

  // ===== getVoteStats =====
  describe("getVoteStats", () => {
    test("should return error if answerId missing", async () => {
      const req = { params: {} };
      const res = createRes();

      await AnswerVoteController.getVoteStats(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        status: "ERR",
        message: "The answerId is required",
      });
    });

    test("should return vote stats if answerId provided", async () => {
      const req = { params: { answerId: "a1" } };
      const res = createRes();
      const fakeResponse = { upvotes: 10, downvotes: 2 };

      jest.spyOn(AnswerVoteService, "getVoteStats").mockResolvedValue(fakeResponse);

      await AnswerVoteController.getVoteStats(req, res);

      expect(AnswerVoteService.getVoteStats).toHaveBeenCalledWith("a1");
      expect(res.statusCode).toBe(200);
      expect(res.data).toBe(fakeResponse);
    });

    test("should return 404 if service throws error", async () => {
      const req = { params: { answerId: "a1" } };
      const res = createRes();
      const errorMsg = "Not found";

      jest.spyOn(AnswerVoteService, "getVoteStats").mockRejectedValue(errorMsg);

      await AnswerVoteController.getVoteStats(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toEqual({ message: errorMsg });
    });
  });

  // ===== getVotesAndAnswersFromUser =====
  describe("getVotesAndAnswersFromUser", () => {
    test("should return error if userId missing", async () => {
      const req = { params: {} };
      const res = createRes();

      await AnswerVoteController.getVotesAndAnswersFromUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        status: "ERR",
        message: "The 'userId' is required",
      });
    });

    test("should return votes and answers if userId provided", async () => {
      const req = { params: { userId: "u123" } };
      const res = createRes();
      const fakeResponse = { votes: [1, 2], answers: [3, 4] };

      jest.spyOn(AnswerVoteService, "getVotesAndAnswersFromUser").mockResolvedValue(fakeResponse);

      await AnswerVoteController.getVotesAndAnswersFromUser(req, res);

      expect(AnswerVoteService.getVotesAndAnswersFromUser).toHaveBeenCalledWith("u123");
      expect(res.statusCode).toBe(200);
      expect(res.data).toBe(fakeResponse);
    });

    test("should return 404 if service throws error with message", async () => {
      const req = { params: { userId: "u123" } };
      const res = createRes();
      const error = new Error("DB failure");

      jest.spyOn(AnswerVoteService, "getVotesAndAnswersFromUser").mockRejectedValue(error);

      await AnswerVoteController.getVotesAndAnswersFromUser(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toEqual({ message: "DB failure" });
    });

    test("should return 404 with default message if error.message missing", async () => {
      const req = { params: { userId: "u123" } };
      const res = createRes();
      const error = {};

      jest.spyOn(AnswerVoteService, "getVotesAndAnswersFromUser").mockRejectedValue(error);

      await AnswerVoteController.getVotesAndAnswersFromUser(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toEqual({ message: "An error occurred while fetching answers from user votes." });
    });
  });
});

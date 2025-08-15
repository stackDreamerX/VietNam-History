const {
  createAdmin,
} = require("../controllers/AdminController"); // đường dẫn tới controller
const AdminService = require("../services/AdminService");

jest.mock("../services/AdminService");

describe("Admin Controller - createAdmin", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        email: "test@example.com",
        name: "Test Admin",
        password: "password123",
        confirmPassword: "password123",
        phone: "0123456789",
        img: "image.jpg",
        birthday: "2000-01-01",
        note: "Test note",
        isAdmin: true,
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

//TAO NGUOI DUNG THANH CONG
  it("should create a new admin successfully", async () => {
    AdminService.createAdmin.mockResolvedValue({
      status: "OK",
      message: "Admin created",
      data: { id: "123", email: "test@example.com" },
    });

    await createAdmin(mockReq, mockRes);

    expect(AdminService.createAdmin).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "OK",
      message: "Admin created",
      data: { id: "123", email: "test@example.com" },
    });
  });

  //EMAIL BI TRONG
  it("should return 400 if missing fields", async () => {
    mockReq.body.email = "";

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "All fields are required.",
    });
  });

  //EMAIL KHONG DUNG DINH DANG
  it("should return 400 for invalid email", async () => {
    mockReq.body.email = "invalid-email";

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "Invalid email format.",
    });
  });

  // TEN BI TRONG
  it("should return 400 if missing fields", async () => {
    mockReq.body.name = "";

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "All fields are required.",
    });
  });
  
  // NGAY SINH BI TRONG
  it("should return 400 if missing fields", async () => {
    mockReq.body.birthday = "";

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "All fields are required.",
    });
  });

  //PASSWORD KHONG KHOP
  it("should return 400 if passwords do not match", async () => {
    mockReq.body.confirmPassword = "differentPassword";

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "Password and confirm password do not match.",
    });
  });

  //KHONG KET NOI DUOC API
  it("should return 500 if service throws an error", async () => {
    AdminService.createAdmin.mockRejectedValue(new Error("Internal error"));

    await createAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "ERR",
      message: "Internal error",
    });
  });
});

const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  authMiddleware,
  authUserMiddleware,
  verifyToken,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/log-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", authMiddleware, userController.deleteUser); //xoá user
router.get("/get-all-user", userController.getAllUser); //lấy info user cho admin
router.get("/get-details/:id", userController.getDetailsUser); //lấy info user cho user
router.post("/refresh-token", userController.refreshToken); //cấp access token mới sau khi token cũ hết hạn dựa vào refresh token
router.get("/view-follower/:id", userController.viewFollower);
router.post("/add-follower/:id", verifyToken, userController.addFollower);
router.post("/remove-follower/:id", verifyToken, userController.removeFollower);
router.get("/following", verifyToken, userController.getFollowingUsers);

// Route lấy danh sách tất cả người dùng trừ người dùng hiện tại
router.get(
  "/get-all-except-self",
  verifyToken,
  userController.getAllUsersExceptSelf
);
router.put("/update-ques-count/:id", userController.updateQuesCount);
router.put("/update-answer-count/:id", userController.updateAnswerCount);
router.put("/toggle-active/:id", userController.toggleActiveUser);
router.get("/filter", userController.filterUsers);
router.put("/update-password", verifyToken, userController.updatePassword);

module.exports = router;

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//set auth cho admin
const authMiddleware = (req, res, next) => {
  const token = req.headers.token?.split(" ")[1];
  // verify a token symmetric
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: "ERR",
        message: "The authentication ",
      });
    }

    //nếu có user isAdmin
    if (user?.isAdmin) {
      console.log("true");
      next();
    } else {
      return res.status(404).json({
        status: "ERR",
        message: "The authentication ",
      });
    }
  });
};

//set auth cho user lấy info của mình
const authUserMiddleware = (req, res, next) => {
  const token = req.headers.token?.split(" ")[1];
  const userId = req.params.id;
  // verify a token symmetric
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: "ERR",
        message: "The authentication ",
      });
    }

    //nếu có user isAdmin
    if (user?.isAdmin || user?.id === userId) {
      //=== thì cho đi tiếp
      console.log("true");
      next();
    } else {
      return res.status(404).json({
        status: "ERR",
        message: "The authentication ",
      });
    }
  });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ status: "ERR", message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    console.log("Decoded token:", decoded);
    req.user = decoded; // Lưu thông tin user
    next();
  } catch (error) {
    res.status(401).json({ status: "ERR", message: "Invalid token" });
  }
};

module.exports = {
  authMiddleware,
  authUserMiddleware,
  verifyToken,
};

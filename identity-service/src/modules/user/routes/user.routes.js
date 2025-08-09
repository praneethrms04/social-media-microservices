const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  userLogout,
} = require("../controllers/user.controller");

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshTokenUser);
authRouter.post("/logout", userLogout);

module.exports = authRouter;

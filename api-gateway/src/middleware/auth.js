const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");

const validateToken = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  if (!token) {
    logger.warn("Access attempt without valid token");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token");
      return res.status(429).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  });
};
module.exports = { validateToken };

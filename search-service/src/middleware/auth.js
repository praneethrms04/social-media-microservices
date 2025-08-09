const logger = require("../utils/logger");

const isAuthenticated = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("access attem[ted without user id");
    return res.status(401).json({
      success: false,
      message: "Authentication required...! Please login to continue",
    });
  }
  console.log(userId)
  req.user = { userId };
  next();
};

module.exports = { isAuthenticated };

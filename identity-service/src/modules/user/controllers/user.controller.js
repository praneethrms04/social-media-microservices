const generateTokens = require("../../../utils/generateToken");
const logger = require("../../../utils/logger");
const {
  validateRegistration,
  validatelogin,
} = require("../../../utils/validation");
const RefreshToken = require("../models/refreshToken.moddel");
const User = require("../models/user.model");

/**
 * @desc Create a new User
 * @route POST
 * @access public
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const registerUser = async (req, res, next) => {
  logger.info("Registration endpoint hit...");

  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

/**
 * @desc Loin User
 * @route POST
 * @access public
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const loginUser = async (req, res, next) => {
  logger.info("User Login endpoint hit... ");
  try {
    const { error } = validatelogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);

      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid User");
      res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      logger.warn("Invalid Password");
      return res.status(400).json({
        success: false,
        message: "InValid Password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      userId: user._id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc Refresh Token
 * @route POST
 * @access public
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const refreshTokenUser = async (req, res, next) => {
  logger.info("Rrefresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storeToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storeToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (!storeToken || storeToken.expiresAt < new Date()) {
      logger.warn("Invalid refresh token provided");
      res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    const user = await User.findById(storeToken.user);

    if (!user) {
      logger.warn("User not found");
      res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToke } =
      await generateTokens(user);

    await RefreshToken.deleteOne({ _id: storeToken._id });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToke,
    });
  } catch (error) {
    logger.error("refresh token error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc Refresh Token
 * @route POST
 * @access public
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const userLogout = async (req, res, next) => {
  logger.info("user logout endpoitn hti....");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token is missing");
      res.status(400).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    const storedRefreshToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

    if (!storedRefreshToken) {
      logger.warn("Invalid refresh token");
      res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    logger.info("Refresh token deleted for logout");

    res.status(200).json({
      success: true,
      message: "Refresh token deleted for logout",
    });
  } catch (error) {
    logger.warn("user logout failed", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenUser,
  userLogout,
};

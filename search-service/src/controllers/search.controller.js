const Search = require("../models/model.search");
const logger = require("../utils/logger");

/**
 * @access private
 * @route /api/v1/search/get
 * @desc search
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const searchPost = async (req, res, next) => {
  logger.info("search post api hittng ");
  try {
    const { query } = req.query;

    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.status(200).json({
      success: true,
      message: "data fetch successfully",
      data: results,
    });
  } catch (error) {
    logger.error("Error while searching post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  searchPost,
};

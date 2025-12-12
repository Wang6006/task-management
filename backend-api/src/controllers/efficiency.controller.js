const ApiError = require("../api-error");
const JSend = require("../jsend");
const efficiencyService = require("../services/efficiency.service");

exports.getEfficiency = async (req, res, next) => {
  try {
    const result = await efficiencyService.calculateEfficiency();

    if (!result) {
      throw new ApiError(404, "No efficiency data found");
    }

    return res.status(200).json(JSend.success(result));
  } catch (error) {
    next(error);
  }
};

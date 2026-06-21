const { success } = require('../utils/response');
const { formatSimulationTime } = require('../utils/validators');

const getMe = async (req, res, next) => {
  try {
    const user = req.user.toJSON ? req.user.toJSON() : req.user;
    const { password, resetToken, resetTokenExpires, ...safe } = user;
    return success(res, {
      ...safe,
      simulationTime: formatSimulationTime(safe.simulationMinute),
    });
  } catch (err) { next(err); }
};

module.exports = { getMe };

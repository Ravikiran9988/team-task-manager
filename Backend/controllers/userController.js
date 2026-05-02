const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers };


const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboardStats = async (req, res, next) => {
  try {
    const projectIds = await Project.find({ members: req.user._id }).distinct("_id");

    const now = new Date();
    const taskQuery = { project: { $in: projectIds } };

    const [totalTasks, completedTasks, pendingTasks, overdueTasks] =
      await Promise.all([
        Task.countDocuments(taskQuery),
        Task.countDocuments({ ...taskQuery, status: "done" }),
        Task.countDocuments({ ...taskQuery, status: { $ne: "done" } }),
        Task.countDocuments({
          ...taskQuery,
          status: { $ne: "done" },
          dueDate: { $lt: now },
        }),
      ]);

    return res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboardStats };

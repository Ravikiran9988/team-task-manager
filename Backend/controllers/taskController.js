const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, assignedTo, project, dueDate } = req.body;

    const projectData = await Project.findById(project);
    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin only access" });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ message: "Assignee user not found" });
    }

    const assigneeIsMember = projectData.members.some(
      (memberId) => memberId.toString() === assignedTo.toString()
    );
    if (!assigneeIsMember) {
      return res
        .status(400)
        .json({ message: "Assignee must be a member of the project" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      project,
      dueDate,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const filter =
      req.user.role === "member"
        ? { project: projectId, assignedTo: req.user._id }
        : { project: projectId };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, title, description, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id).populate("project");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied to this task" });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin) {
      if (!isAssignee) {
        return res.status(403).json({ message: "You can only update your tasks" });
      }

      const hasNonStatusFields =
        assignedTo !== undefined ||
        title !== undefined ||
        description !== undefined ||
        dueDate !== undefined;
      if (hasNonStatusFields) {
        return res
          .status(403)
          .json({ message: "Members can only update task status" });
      }
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({ message: "Assignee user not found" });
      }
      const assigneeIsMember = task.project.members.some(
        (memberId) => memberId.toString() === assignedTo.toString()
      );
      if (!assigneeIsMember) {
        return res
          .status(400)
          .json({ message: "Assignee must be a member of the project" });
      }
      task.assignedTo = assignedTo;
    }

    if (status) task.status = status;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };

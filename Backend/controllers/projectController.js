const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res, next) => {
  try {
    const { title, description, members = [] } = req.body;

    const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: uniqueMembers,
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    return next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    return res.status(200).json({ projects });
  } catch (error) {
    return next(error);
  }
};

const addMemberToProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const member = await User.findOne({ email: normalizedEmail });
    if (!member) {
      return res.status(404).json({ message: "User with that email not found" });
    }

    const alreadyMember = project.members.some(
      (memberObjectId) => memberObjectId.toString() === member._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a project member" });
    }

    project.members.push(member._id);
    await project.save();

    return res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createProject, getProjects, addMemberToProject };

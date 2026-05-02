const express = require("express");
const { body, param } = require("express-validator");
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin"),
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("description").optional().isString().withMessage("Description must be text"),
    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Status must be todo, in-progress, or done"),
    body("assignedTo").isMongoId().withMessage("Valid assignee ID is required"),
    body("project").isMongoId().withMessage("Valid project ID is required"),
    body("dueDate")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Due date must be a valid date"),
  ],
  validationMiddleware,
  createTask
);

router.get(
  "/project/:projectId",
  [param("projectId").isMongoId().withMessage("Valid project ID is required")],
  validationMiddleware,
  getTasksByProject
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Valid task ID is required"),
    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Status must be todo, in-progress, or done"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Assigned user must be a valid ID"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().isString().withMessage("Description must be text"),
    body("dueDate")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Due date must be a valid date"),
  ],
  validationMiddleware,
  updateTask
);

router.delete(
  "/:id",
  roleMiddleware("admin"),
  [param("id").isMongoId().withMessage("Valid task ID is required")],
  validationMiddleware,
  deleteTask
);

module.exports = router;

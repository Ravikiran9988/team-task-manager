const express = require("express");
const { body, param } = require("express-validator");
const {
  createProject,
  getProjects,
  addMemberToProject,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin"),
  [
    body("title").trim().notEmpty().withMessage("Project title is required"),
    body("description").optional().isString().withMessage("Description must be text"),
    body("members")
      .optional()
      .isArray()
      .withMessage("Members must be an array of user IDs"),
  ],
  validationMiddleware,
  createProject
);

router.get("/", getProjects);

router.post(
  "/:id/add-member",
  roleMiddleware("admin"),
  [
    param("id").isMongoId().withMessage("Valid project ID is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validationMiddleware,
  addMemberToProject
);

module.exports = router;

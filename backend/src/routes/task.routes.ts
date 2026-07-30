import { Router } from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from "../controllers/task.controller";

import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createTaskValidator,
  updateTaskValidator,
} from "../validators/task.validator";

const router = Router();

router.use(protect);
router.post(
  "/",
  createTaskValidator,
  validate,
  createTask
);
router.get("/", getTasks);
router.get("/:id", getTask);
router.put(
  "/:id",
  updateTaskValidator,
  validate,
  updateTask
);
router.patch("/:id/complete", toggleTaskCompletion);
router.delete("/:id", deleteTask);

export default router;
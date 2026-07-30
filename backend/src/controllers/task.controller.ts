import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth.middleware";
import { sortTasks } from "../utils/taskSort";

// Create a new task
export const createTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      description,
      deadline,
      priority,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      priority,
      user: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// Get all tasks of logged-in user
export const getTasks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
    });

    const sortedTasks = sortTasks(tasks);

    return res.status(200).json({
      success: true,
      count: sortedTasks.length,
      tasks: sortedTasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// Get single task
export const getTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

// Update task
export const updateTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      description,
      deadline,
      priority,
    } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        title,
        description,
        deadline,
        priority,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// Mark task as completed / incomplete
export const toggleTaskCompletion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.completed = !task.completed;

    await task.save();

    return res.status(200).json({
      success: true,
      message: task.completed
        ? "Task completed"
        : "Task marked as incomplete",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update task status",
    });
  }
};

// Delete task
export const deleteTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};
import { Request, Response } from "express";
import Todo from "../models/Todo";
import { AuthRequest } from "../middleware/auth.middleware";

// ==========================================
// CREATE TODO
// ==========================================

export const createTodo = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      dateTime,
      deadline,
      priority,
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Validate priority
    const allowedPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Priority must be low, medium or high",
      });
    }

    const userId = (req as AuthRequest).userId;

    const todo = await Todo.create({
      title: title.trim(),

      description:
        description?.trim() || "",

      dateTime:
        dateTime || undefined,

      deadline:
        deadline || undefined,

      priority:
        priority || "medium",

      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      todo,
    });
  } catch (error) {
    console.error(
      "CREATE TODO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// GET TODOS
// ==========================================

export const getTodos = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      (req as AuthRequest).userId;

    const todos = await Todo.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      todos,
    });
  } catch (error) {
    console.error(
      "GET TODOS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// UPDATE TODO
// ==========================================

export const updateTodo = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      dateTime,
      deadline,
      priority,
      completed,
    } = req.body;

    const userId =
      (req as AuthRequest).userId;

    // --------------------------------------
    // Validate priority
    // --------------------------------------

    const allowedPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      priority !== undefined &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Priority must be low, medium or high",
      });
    }

    // --------------------------------------
    // Prepare update data
    // --------------------------------------

    const updateData: {
      title?: string;
      description?: string;
      dateTime?: Date;
      deadline?: Date;
      priority?: "low" | "medium" | "high";
      completed?: boolean;
    } = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      updateData.title =
        title.trim();
    }

    if (description !== undefined) {
      updateData.description =
        description.trim();
    }

    if (dateTime !== undefined) {
      updateData.dateTime =
        dateTime
          ? new Date(dateTime)
          : undefined;
    }

    if (deadline !== undefined) {
      updateData.deadline =
        deadline
          ? new Date(deadline)
          : undefined;
    }

    if (priority !== undefined) {
      updateData.priority =
        priority;
    }

    if (completed !== undefined) {
      updateData.completed =
        completed;
    }

    // --------------------------------------
    // Find and update todo
    // --------------------------------------

    const todo =
      await Todo.findOneAndUpdate(
        {
          _id: id,
          user: userId,
        },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Todo updated successfully",
      todo,
    });
  } catch (error) {
    console.error(
      "UPDATE TODO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// DELETE TODO
// ==========================================

export const deleteTodo = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const userId =
      (req as AuthRequest).userId;

    const todo =
      await Todo.findOneAndDelete({
        _id: id,
        user: userId,
      });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Todo deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE TODO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
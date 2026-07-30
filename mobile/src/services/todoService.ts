import api from "./api";

// ==========================================
// TODO TYPE
// ==========================================

export interface Todo {
  _id: string;

  title: string;

  description?: string;

  dateTime?: string;

  deadline?: string;

  priority: "low" | "medium" | "high";

  completed: boolean;

  user: string;

  createdAt: string;

  updatedAt: string;
}

// ==========================================
// CREATE TODO DATA
// ==========================================

export interface CreateTodoData {
  title: string;

  description?: string;

  dateTime?: string;

  deadline?: string;

  priority?: "low" | "medium" | "high";
}

// ==========================================
// UPDATE TODO DATA
// ==========================================

export interface UpdateTodoData {
  title?: string;

  description?: string;

  dateTime?: string;

  deadline?: string;

  priority?: "low" | "medium" | "high";

  completed?: boolean;
}

// ==========================================
// GET TODOS
// ==========================================

export const getTodos = async () => {
  const response =
    await api.get("/todos");

  return response.data as {
    success: boolean;
    todos: Todo[];
  };
};

// ==========================================
// CREATE TODO
// ==========================================

export const createTodo = async (
  data: CreateTodoData
) => {
  const response =
    await api.post(
      "/todos",
      data
    );

  return response.data as {
    success: boolean;
    message: string;
    todo: Todo;
  };
};

// ==========================================
// UPDATE TODO
// ==========================================

export const updateTodo = async (
  id: string,
  data: UpdateTodoData
) => {
  const response =
    await api.put(
      `/todos/${id}`,
      data
    );

  return response.data as {
    success: boolean;
    message: string;
    todo: Todo;
  };
};

// ==========================================
// DELETE TODO
// ==========================================

export const deleteTodo = async (
  id: string
) => {
  const response =
    await api.delete(
      `/todos/${id}`
    );

  return response.data as {
    success: boolean;
    message: string;
  };
};
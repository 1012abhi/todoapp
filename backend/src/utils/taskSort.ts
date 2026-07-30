import { ITask } from "../models/Task";

const priorityWeight: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const calculateTaskScore = (task: ITask) => {
  const now = Date.now();

  const deadlineTime = task.deadline
    ? new Date(task.deadline).getTime()
    : now + 7 * 24 * 60 * 60 * 1000;

  const hoursRemaining =
    (deadlineTime - now) / (1000 * 60 * 60);

  const priorityScore =
    (priorityWeight[task.priority] || 1) * 100;

  const urgencyScore =
    Math.max(0, 100 - hoursRemaining);

  const completionPenalty =
    task.completed ? -1000 : 0;

  return (
    priorityScore +
    urgencyScore +
    completionPenalty
  );
};

export const sortTasks = (tasks: ITask[]) => {
  return tasks.sort(
    (a, b) =>
      calculateTaskScore(b) -
      calculateTaskScore(a)
  );
};
import { Router } from "express";
import { container } from "tsyringe";
import { TaskController } from "@/task/controller/TaskController";

const taskRoutes = Router();

taskRoutes.post("/:projectId/tasks", (req, res) => {
	const taskController = container.resolve(TaskController);
	return taskController.create(req, res);
});

taskRoutes.put("/:id", (req, res) => {
	const taskController = container.resolve(TaskController);
	return taskController.update(req, res);
});

taskRoutes.delete("/:id", (req, res) => {
	const taskController = container.resolve(TaskController);
	return taskController.delete(req, res);
});

export { taskRoutes };

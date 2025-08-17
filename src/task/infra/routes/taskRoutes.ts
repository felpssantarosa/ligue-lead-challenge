import { Router } from "express";
import { container } from "tsyringe";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
	UpdateTaskController,
} from "@/task/controller";

const taskRoutes = Router();
const taskRoutesBoundByProject = Router();

// Get task: GET /api/tasks/:id
taskRoutes.get("/:id", (req, res) => {
	const getTaskController = container.resolve(GetTaskController);
	return getTaskController.handle(req, res);
});

// Update task: PUT /api/tasks/:id
taskRoutes.put("/:id", (req, res) => {
	const updateTaskController = container.resolve(UpdateTaskController);
	return updateTaskController.handle(req, res);
});

// Delete task: DELETE /api/tasks/:id
taskRoutes.delete("/:id", (req, res) => {
	const deleteTaskController = container.resolve(DeleteTaskController);
	return deleteTaskController.handle(req, res);
});

// Create task under project: POST /api/projects/:projectId/tasks
taskRoutesBoundByProject.post("/:projectId/tasks", (req, res) => {
	const createTaskController = container.resolve(CreateTaskController);
	return createTaskController.create(req, res);
});

export { taskRoutes, taskRoutesBoundByProject };

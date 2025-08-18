import { Router } from "express";
import { container } from "tsyringe";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
	UpdateTaskController,
} from "@/task/controller";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";
import { authMiddleware } from "@/user/infra/middleware/authMiddleware";

const taskRoutes = Router();
const taskRoutesBoundByProject = Router();

// Apply authentication middleware to all routes
taskRoutes.use(authMiddleware);
taskRoutesBoundByProject.use(authMiddleware);

// Get task: GET /api/tasks/:id
taskRoutes.get("/:id", (req, res) => {
	const getTaskController = container.resolve(GetTaskController);
	return getTaskController.handle(req, res);
});

// Update task: PUT /api/tasks/:id
taskRoutes.put("/:id", (req, res) => {
	const updateTaskController = container.resolve(UpdateTaskController);
	return updateTaskController.handle(
		req as unknown as AuthenticatedRequest,
		res,
	);
});

// Delete task: DELETE /api/tasks/:id
taskRoutes.delete("/:id", (req, res) => {
	const deleteTaskController = container.resolve(DeleteTaskController);
	return deleteTaskController.handle(
		req as unknown as AuthenticatedRequest,
		res,
	);
});

// Create task under project: POST /api/projects/:projectId/tasks
taskRoutesBoundByProject.post("/:projectId/tasks", (req, res) => {
	const createTaskController = container.resolve(CreateTaskController);
	return createTaskController.create(
		req as unknown as AuthenticatedRequest,
		res,
	);
});

export { taskRoutes, taskRoutesBoundByProject };

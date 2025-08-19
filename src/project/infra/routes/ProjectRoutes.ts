import { Router } from "express";
import { container } from "tsyringe";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	GitHubIntegrationController,
	UpdateProjectController,
} from "@/project/controller";
import {
	type AuthenticatedRequest,
	authMiddleware,
} from "@/user/infra/middleware/authMiddleware";

const projectRoutes = Router();

// Public routes (no authentication required)
projectRoutes.get("/", (req, res) => {
	const getAllController = container.resolve(GetAllProjectsController);
	return getAllController.handle(req, res);
});
projectRoutes.get("/:id", (req, res) => {
	const getController = container.resolve(GetProjectController);
	return getController.handle(req, res);
});

// Protected routes (authentication required)
projectRoutes.post("/", authMiddleware, (req, res) => {
	const createController = container.resolve(CreateProjectController);
	return createController.handle(req as unknown as AuthenticatedRequest, res);
});
projectRoutes.put("/:id", authMiddleware, (req, res) => {
	const updateController = container.resolve(UpdateProjectController);
	return updateController.handle(req as unknown as AuthenticatedRequest, res);
});
projectRoutes.delete("/:id", authMiddleware, (req, res) => {
	const deleteController = container.resolve(DeleteProjectController);
	return deleteController.handle(req as unknown as AuthenticatedRequest, res);
});

// GitHub integration route (protected)
projectRoutes.get("/:id/github/:username", authMiddleware, (req, res) => {
	const githubController = container.resolve(GitHubIntegrationController);
	return githubController.handle(req as unknown as AuthenticatedRequest, res);
});

export { projectRoutes };

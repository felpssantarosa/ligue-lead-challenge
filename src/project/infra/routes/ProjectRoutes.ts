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

// Apply authentication middleware to all routes
projectRoutes.use(authMiddleware);

projectRoutes.post("/", (req, res) => {
	const createController = container.resolve(CreateProjectController);
	return createController.handle(req as unknown as AuthenticatedRequest, res);
});
projectRoutes.get("/", (req, res) => {
	const getAllController = container.resolve(GetAllProjectsController);
	return getAllController.handle(req, res);
});
projectRoutes.get("/:id", (req, res) => {
	const getController = container.resolve(GetProjectController);
	return getController.handle(req, res);
});
projectRoutes.put("/:id", (req, res) => {
	const updateController = container.resolve(UpdateProjectController);
	return updateController.handle(req as unknown as AuthenticatedRequest, res);
});
projectRoutes.delete("/:id", (req, res) => {
	const deleteController = container.resolve(DeleteProjectController);
	return deleteController.handle(req as unknown as AuthenticatedRequest, res);
});

// GitHub integration route
projectRoutes.get("/:id/github/:username", (req, res) => {
	const githubController = container.resolve(GitHubIntegrationController);
	return githubController.handle(req, res);
});

export { projectRoutes };

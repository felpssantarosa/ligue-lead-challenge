import { Router } from "express";
import { container } from "tsyringe";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";

const projectRoutes = Router();

projectRoutes.post("/", (req, res) => {
	const createController = container.resolve(CreateProjectController);
	return createController.handle(req, res);
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
	return updateController.handle(req, res);
});
projectRoutes.delete("/:id", (req, res) => {
	const deleteController = container.resolve(DeleteProjectController);
	return deleteController.handle(req, res);
});

export { projectRoutes };

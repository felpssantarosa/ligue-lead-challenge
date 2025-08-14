import { container } from "tsyringe";
import "reflect-metadata";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import { TaskController } from "@/task/controller/TaskController";
import type { TaskRepository } from "@/task/domain/TaskRepository";
import { SequelizeTaskRepository } from "@/task/infra/database/SequelizeTaskRepository";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { MockProjectRepository } from "@/test/mocks/repositories/MockProjectRepository";

export const registerDependencies = (): void => {
	container.registerSingleton<ValidationProvider>(
		"ValidationProvider",
		ZodValidationProvider,
	);

	container.registerSingleton("Validation", ValidationHandler);

	container.registerSingleton<ProjectRepository>(
		"ProjectRepository",
		MockProjectRepository,
	);
	container.registerSingleton<TaskRepository>(
		"TaskRepository",
		SequelizeTaskRepository,
	);

	container.registerSingleton("CreateProjectService", CreateProjectService);
	container.registerSingleton("GetProjectService", GetProjectService);
	container.registerSingleton("GetAllProjectsService", GetAllProjectsService);
	container.registerSingleton("UpdateProjectService", UpdateProjectService);
	container.registerSingleton("DeleteProjectService", DeleteProjectService);
	container.registerSingleton("CreateTaskService", CreateTaskService);

	container.registerSingleton(CreateProjectController);
	container.registerSingleton(GetProjectController);
	container.registerSingleton(GetAllProjectsController);
	container.registerSingleton(UpdateProjectController);
	container.registerSingleton(DeleteProjectController);
	container.registerSingleton(TaskController);
};

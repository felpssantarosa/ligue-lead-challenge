import { container } from "tsyringe";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import { SequelizeProjectRepository } from "@/project/infra";
import {
	CreateProjectService,
	DeleteProjectService,
	GetAllProjectsService,
	GetProjectService,
	ProjectService,
	UpdateProjectService,
} from "@/project/service";
import type { CacheProvider } from "@/shared/cache";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
	UpdateTaskController,
} from "@/task/controller";
import { SequelizeTaskRepository, TaskModel } from "@/task/infra";
import {
	CreateTaskService,
	DeleteByProjectIdService,
	DeleteTaskService,
	GetAllTasksService,
	GetTaskService,
	GetTasksByProjectService,
	TaskService,
	UpdateTaskService,
} from "@/task/service";
import { MockCacheProvider } from "@/test/mocks";
import { createTestDatabase, setupTestDatabase } from "./database";

export const setupE2EContainer = async (): Promise<void> => {
	await setupTestDatabase();

	const sequelize = createTestDatabase();

	const ProjectModel = sequelize.models
		.ProjectModel as typeof import("@/project/infra/database/models/SequelizeProjectModel").default;

	// Cache
	container.registerSingleton<CacheProvider>(
		"CacheProvider",
		MockCacheProvider,
	);

	container.registerSingleton<ValidationProvider>(
		"ValidationProvider",
		ZodValidationProvider,
	);
	container.registerSingleton("Validation", ValidationHandler);

	container.registerInstance(
		"ProjectRepository",
		new SequelizeProjectRepository(ProjectModel),
	);
	container.registerInstance(
		"TaskRepository",
		new SequelizeTaskRepository(TaskModel),
	);

	container.registerSingleton("CreateProjectService", CreateProjectService);
	container.registerSingleton("GetProjectService", GetProjectService);
	container.registerSingleton("GetAllProjectsService", GetAllProjectsService);
	container.registerSingleton("UpdateProjectService", UpdateProjectService);
	container.registerSingleton("DeleteProjectService", DeleteProjectService);
	container.registerSingleton("ProjectService", ProjectService);

	container.registerSingleton("CreateTaskService", CreateTaskService);
	container.registerSingleton("GetTaskService", GetTaskService);
	container.registerSingleton("UpdateTaskService", UpdateTaskService);
	container.registerSingleton("DeleteTaskService", DeleteTaskService);
	container.registerSingleton(
		"DeleteByProjectIdService",
		DeleteByProjectIdService,
	);
	container.registerSingleton("GetAllTasksService", GetAllTasksService);
	container.registerSingleton(
		"GetTasksByProjectService",
		GetTasksByProjectService,
	);
	container.registerSingleton("TaskService", TaskService);

	container.registerSingleton(CreateProjectController);
	container.registerSingleton(GetProjectController);
	container.registerSingleton(GetAllProjectsController);
	container.registerSingleton(UpdateProjectController);
	container.registerSingleton(DeleteProjectController);
	container.registerSingleton(CreateTaskController);
	container.registerSingleton(GetTaskController);
	container.registerSingleton(UpdateTaskController);
	container.registerSingleton(DeleteTaskController);
};

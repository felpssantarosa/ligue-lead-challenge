import { container } from "tsyringe";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import { SequelizeProjectRepository } from "@/project/infra/repository/SequelizeRepository";
import { ProjectService } from "@/project/service";
import { CreateProjectService } from "@/project/service/create/CreateProjectService";
import { DeleteProjectService } from "@/project/service/delete/DeleteProjectService";
import { GetProjectService } from "@/project/service/get/GetProjectService";
import { GetAllProjectsService } from "@/project/service/get-all/GetAllProjectsService";
import { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import type { CacheProvider } from "@/shared/cache";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
} from "@/task/controller";
import { UpdateTaskController } from "@/task/controller/UpdateTaskController";
import { TaskModel } from "@/task/infra";
import { SequelizeTaskRepository } from "@/task/infra/repository/SequelizeTaskRepository";
import { TaskService } from "@/task/service";
import { CreateTaskService } from "@/task/service/create/CreateTaskService";
import { DeleteByProjectIdService } from "@/task/service/delete-by-project-id/DeleteByProjectIdService";
import { DeleteTaskService } from "@/task/service/delete/DeleteTaskService";
import { GetAllTasksService } from "@/task/service/get-all/GetAllTasksService";
import { GetTaskService } from "@/task/service/get/GetTaskService";
import { GetTasksByProjectService } from "@/task/service/get-by-project-td/GetTasksByProjectService";
import { UpdateTaskService } from "@/task/service/update/UpdateTaskService";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";
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

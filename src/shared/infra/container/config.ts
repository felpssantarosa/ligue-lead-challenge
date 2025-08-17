import type { Sequelize } from "sequelize";
import { container } from "tsyringe";
import "reflect-metadata";
import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import { SequelizeProjectRepository } from "@/project/infra";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import { ProjectService } from "@/project/service";
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import type { CacheProvider } from "@/shared/cache";
import { RedisCacheProvider } from "@/shared/cache";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import { DeleteTaskController } from "@/task/controller";
import { CreateTaskController } from "@/task/controller/CreateTaskController";
import { GetTaskController } from "@/task/controller/GetTaskController";
import { UpdateTaskController } from "@/task/controller/UpdateTaskController";
import { SequelizeTaskRepository } from "@/task/infra";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";
import { TaskService } from "@/task/service";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { DeleteByProjectIdService } from "@/task/service/DeleteByProjectIdService";
import { DeleteTaskService } from "@/task/service/DeleteTaskService";
import { GetAllTasksService } from "@/task/service/GetAllTasksService";
import { GetTaskService } from "@/task/service/GetTaskService";
import { GetTasksByProjectService } from "@/task/service/GetTasksByProjectService";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";

export const registerDependencies = (sequelize: Sequelize): void => {
	// Get connected models
	const ProjectModel = sequelize.models
		.ProjectModel as typeof import("@/project/infra/database/models/SequelizeProjectModel").default;
	const TaskModel = sequelize.models
		.TaskModel as typeof import("@/task/infra/database/models/SequelizeTaskModel").default;

	// Clear existing instances to avoid conflicts
	container.clearInstances();

	// Cache - only register if not already registered (for testing)
	if (!container.isRegistered("CacheProvider")) {
		container.registerSingleton<CacheProvider>(
			"CacheProvider",
			RedisCacheProvider,
		);
	}

	// Validation
	container.registerSingleton<ValidationProvider>(
		"ValidationProvider",
		ZodValidationProvider,
	);
	container.registerSingleton("Validation", ValidationHandler);

	// Repositories
	container.registerInstance<ProjectRepository>(
		"ProjectRepository",
		new SequelizeProjectRepository(ProjectModel),
	);
	container.registerInstance<TaskRepository>(
		"TaskRepository",
		new SequelizeTaskRepository(TaskModel),
	);

	// Project Services
	container.registerSingleton("CreateProjectService", CreateProjectService);
	container.registerSingleton("GetProjectService", GetProjectService);
	container.registerSingleton("GetAllProjectsService", GetAllProjectsService);
	container.registerSingleton("UpdateProjectService", UpdateProjectService);
	container.registerSingleton("DeleteProjectService", DeleteProjectService);
	container.registerSingleton("ProjectService", ProjectService);

	// Task Services
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

	// Project Controllers
	container.registerSingleton(CreateProjectController);
	container.registerSingleton(GetProjectController);
	container.registerSingleton(GetAllProjectsController);
	container.registerSingleton(UpdateProjectController);
	container.registerSingleton(DeleteProjectController);

	// Task Controllers
	container.registerSingleton(CreateTaskController);
	container.registerSingleton(GetTaskController);
	container.registerSingleton(UpdateTaskController);
	container.registerSingleton(DeleteTaskController);
};

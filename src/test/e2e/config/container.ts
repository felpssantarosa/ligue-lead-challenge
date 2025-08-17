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
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
} from "@/task/controller";
import { UpdateTaskController } from "@/task/controller/UpdateTaskController";
import { SequelizeTaskRepository } from "@/task/infra/repository/SequelizeTaskRepository";
import { TaskService } from "@/task/service";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { DeleteTaskService } from "@/task/service/DeleteTaskService";
import { GetAllTasksService } from "@/task/service/GetAllTasksService";
import { GetTaskService } from "@/task/service/GetTaskService";
import { GetTasksByProjectService } from "@/task/service/GetTasksByProjectService";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { createTestDatabase, setupTestDatabase } from "./database";
import { TaskModel } from "@/task/infra";

export const setupE2EContainer = async (): Promise<void> => {
	await setupTestDatabase();

	const sequelize = createTestDatabase();

	const ProjectModel = sequelize.models
		.ProjectModel as typeof import("@/project/infra/database/models/SequelizeProjectModel").default;

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

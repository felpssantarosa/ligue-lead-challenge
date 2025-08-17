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
import { ProjectService } from "@/project/service";
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";
import { DeleteTaskController } from "@/task/controller";
import { UpdateTaskController } from "@/task/controller/UpdateTaskController";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";
import { TaskService } from "@/task/service";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { DeleteTaskService } from "@/task/service/DeleteTaskService";
import { GetAllTasksService } from "@/task/service/GetAllTasksService";
import { GetTaskService } from "@/task/service/GetTaskService";
import { GetTasksByProjectService } from "@/task/service/GetTasksByProjectService";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { MockProjectRepository } from "@/test/mocks/repositories/MockProjectRepository";
import { MockTaskRepository } from "@/test/mocks/repositories/MockTaskRepository";

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
		MockTaskRepository,
	);

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
	container.registerSingleton(UpdateTaskController);
	container.registerSingleton(DeleteTaskController);
};

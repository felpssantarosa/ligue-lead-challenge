import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CheckProjectOwnershipService } from "@/project/service";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors/NotFoundError";
import { Task } from "@/task/domain";
import type { TaskRepository } from "@/task/infra";
import type { UserService } from "@/user/service";

export interface CreateTaskServiceParams {
	title: string;
	description: string;
	status: TaskStatus;
	projectId: EntityId;
	ownerId: EntityId;
}

export interface CreateTaskServiceResponse {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	projectId: string;
	createdAt: Date;
	updatedAt: Date;
}

@injectable()
export class CreateTaskService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
		@inject("CheckProjectOwnershipService")
		private readonly checkProjectOwnershipService: CheckProjectOwnershipService,
		@inject("UserService") private readonly userService: UserService,
	) {}

	async execute(
		request: CreateTaskServiceParams,
	): Promise<CreateTaskServiceResponse> {
		// Validate title
		if (!request.title.trim()) {
			throw new Error("Task title cannot be empty");
		}

		// Validate user exists and is authenticated
		const existingUser = await this.userService.findById({
			userId: request.ownerId,
		});

		if (!existingUser) {
			throw NotFoundError.user(request.ownerId, "CreateTaskService.execute");
		}

		// Validate project exists
		const project = await this.projectRepository.findById(request.projectId);

		if (!project) {
			throw new NotFoundError({
				message: `Project with id ${request.projectId} not found`,
				resourceType: "Project",
				resourceId: request.projectId,
				trace: "CreateTaskService.execute",
			});
		}

		// Validate user owns the project
		const hasOwnership = await this.checkProjectOwnershipService.execute({
			projectId: request.projectId,
			ownerId: request.ownerId,
		});

		if (!hasOwnership) {
			throw NotFoundError.project(
				request.projectId,
				"CreateTaskService.execute",
			);
		}

		const task = Task.create({
			title: request.title,
			description: request.description,
			status: request.status,
			projectId: request.projectId,
		});

		const savedTask = await this.taskRepository.save(task);

		await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());
		const tasksByProjectKey = CacheKeys.tasksByProject(request.projectId);
		await this.cacheProvider.delete(tasksByProjectKey);

		project.updateTaskIds([...project.taskIds, savedTask.id]);

		await this.projectRepository.update(project);
		const projectCacheKey = CacheKeys.project(request.projectId);
		await this.cacheProvider.delete(projectCacheKey);

		return {
			id: savedTask.id,
			title: savedTask.title,
			description: savedTask.description,
			status: savedTask.status,
			projectId: savedTask.projectId,
			createdAt: savedTask.createdAt,
			updatedAt: savedTask.updatedAt,
		};
	}
}

import { inject, injectable } from "tsyringe";
import type { CheckProjectOwnershipService } from "@/project/service";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra";
import type { UserService } from "@/user/service";

export interface UpdateTaskServiceParams {
	taskId: EntityId;
	ownerId: EntityId;
	title?: string;
	description?: string;
	status?: TaskStatus;
}

export interface UpdateTaskServiceResponse {
	id: string;
	title: string;
	description: string;
	status: string;
	projectId: string;
	createdAt: Date;
	updatedAt: Date;
}

@injectable()
export class UpdateTaskService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
		@inject("CheckProjectOwnershipService")
		private readonly checkProjectOwnershipService: CheckProjectOwnershipService,
		@inject("UserService") private readonly userService: UserService,
	) {}

	async execute(
		request: UpdateTaskServiceParams,
	): Promise<UpdateTaskServiceResponse> {
		// Validate user exists and is authenticated
		const existingUser = await this.userService.findById({
			userId: request.ownerId,
		});

		if (!existingUser) {
			throw NotFoundError.user(request.ownerId, "UpdateTaskService.execute");
		}

		// Find the task
		const taskFound = await this.taskRepository.findById(request.taskId);

		if (!taskFound) {
			throw new NotFoundError({
				message: `Task with id ${request.taskId} not found`,
				resourceType: "Task",
				resourceId: request.taskId,
			});
		}

		// Validate user owns the project that contains this task
		const hasOwnership = await this.checkProjectOwnershipService.execute({
			projectId: taskFound.projectId,
			ownerId: request.ownerId,
		});

		if (!hasOwnership) {
			throw NotFoundError.project(
				taskFound.projectId,
				"UpdateTaskService.execute",
			);
		}

		taskFound.update({
			title: request.title,
			description: request.description,
			status: request.status,
		});

		const updatedTask = await this.taskRepository.update(taskFound);

		const taskCacheKey = CacheKeys.task(request.taskId);
		await this.cacheProvider.delete(taskCacheKey);
		await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());

		const tasksByProjectKey = CacheKeys.tasksByProject(updatedTask.projectId);
		await this.cacheProvider.delete(tasksByProjectKey);
		const projectCacheKey = CacheKeys.project(updatedTask.projectId);
		await this.cacheProvider.delete(projectCacheKey);

		return {
			id: updatedTask.id,
			title: updatedTask.title,
			description: updatedTask.description,
			status: updatedTask.status,
			projectId: updatedTask.projectId,
			createdAt: updatedTask.createdAt,
			updatedAt: updatedTask.updatedAt,
		};
	}
}

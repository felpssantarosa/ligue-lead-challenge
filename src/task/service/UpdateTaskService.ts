import { inject, injectable } from "tsyringe";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra";

export interface UpdateTaskServiceParams {
	id: EntityId;
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
	) {}

	async execute(
		request: UpdateTaskServiceParams,
	): Promise<UpdateTaskServiceResponse> {
		const taskFound = await this.taskRepository.findById(request.id);

		if (!taskFound) {
			throw new NotFoundError({
				message: `Task with id ${request.id} not found`,
				resourceType: "Task",
				resourceId: request.id,
			});
		}

		taskFound.update({
			title: request.title,
			description: request.description,
			status: request.status,
		});

		const updatedTask = await this.taskRepository.update(taskFound);

		const taskCacheKey = CacheKeys.task(request.id);
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

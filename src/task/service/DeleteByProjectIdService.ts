import { inject, injectable } from "tsyringe";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskRepository } from "@/task/infra";

export type DeleteByProjectIdServiceParams = EntityId;

export type DeleteByProjectIdServiceResponse = {
	projectId: EntityId;
	deletedTasksCount: number;
	deletedAt: Date;
};

@injectable()
export class DeleteByProjectIdService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
	) {}

	async execute(
		projectId: DeleteByProjectIdServiceParams,
	): Promise<DeleteByProjectIdServiceResponse> {
		// Find all tasks for this project to count them before deletion
		const existingTasks = await this.taskRepository.findByProjectId(projectId);
		const deletedTasksCount = existingTasks.length;

		// Delete all tasks for this project
		await this.taskRepository.deleteByProjectId(projectId);

		// Invalidate cache for individual tasks (gracefully handle errors)
		for (const task of existingTasks) {
			try {
				const taskCacheKey = CacheKeys.task(task.id);
				await this.cacheProvider.delete(taskCacheKey);
			} catch (error) {
				// Log cache error but don't fail the operation
				console.warn(`Failed to invalidate cache for task ${task.id}:`, error);
			}
		}

		// Invalidate cache patterns (gracefully handle errors)
		try {
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());
		} catch (error) {
			console.warn("Failed to invalidate all tasks lists cache:", error);
		}

		try {
			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);
			await this.cacheProvider.delete(tasksByProjectKey);
		} catch (error) {
			console.warn(`Failed to invalidate tasks by project cache for ${projectId}:`, error);
		}

		try {
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksByProject());
		} catch (error) {
			console.warn("Failed to invalidate all tasks by project cache:", error);
		}

		try {
			await this.cacheProvider.deleteByPattern(CacheKeys.taskPattern());
		} catch (error) {
			console.warn("Failed to invalidate task pattern cache:", error);
		}

		return {
			projectId,
			deletedTasksCount,
			deletedAt: new Date(),
		};
	}
}

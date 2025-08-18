import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CheckProjectOwnershipService } from "@/project/service";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra";
import type { UserService } from "@/user/service";

export type DeleteTaskServiceParams = {
	taskId: EntityId;
	ownerId: EntityId;
};

export type DeleteTaskServiceResponse = undefined;

@injectable()
export class DeleteTaskService {
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
		params: DeleteTaskServiceParams,
	): Promise<DeleteTaskServiceResponse> {
		// Validate user exists and is authenticated
		const existingUser = await this.userService.findById({
			userId: params.ownerId,
		});

		if (!existingUser) {
			throw NotFoundError.user(params.ownerId, "DeleteTaskService.execute");
		}

		// Find the task
		const task = await this.taskRepository.findById(params.taskId);

		if (!task) throw NotFoundError.task(params.taskId);

		// Validate user owns the project that contains this task
		const hasOwnership = await this.checkProjectOwnershipService.execute({
			projectId: task.projectId,
			ownerId: params.ownerId,
		});

		if (!hasOwnership) {
			throw NotFoundError.project(task.projectId, "DeleteTaskService.execute");
		}

		const project = await this.projectRepository.findById(task.projectId);

		if (!project) throw NotFoundError.project(task.projectId);

		project.updateTaskIds(project.taskIds.filter((id) => id !== task.id));

		await this.projectRepository.update(project);
		await this.taskRepository.delete(params.taskId);

		// Invalidate cache for this specific task
		const taskCacheKey = CacheKeys.task(params.taskId);
		await this.cacheProvider.delete(taskCacheKey);

		// Invalidate all task lists cache
		await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());

		// Invalidate tasks cache for the project this task belonged to
		const tasksByProjectKey = CacheKeys.tasksByProject(task.projectId);
		await this.cacheProvider.delete(tasksByProjectKey);

		// Invalidate the project cache since task data affects project relations
		const projectCacheKey = CacheKeys.project(task.projectId);
		await this.cacheProvider.delete(projectCacheKey);
	}
}

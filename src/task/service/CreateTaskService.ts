import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors/NotFoundError";
import { Task } from "@/task/domain";
import type { TaskRepository } from "@/task/infra";

export interface CreateTaskServiceParams {
	title: string;
	description: string;
	status: TaskStatus;
	projectId: EntityId;
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
	) {}

	async execute(
		request: CreateTaskServiceParams,
	): Promise<CreateTaskServiceResponse> {
		if (!request.title.trim()) {
			throw new Error("Task title cannot be empty");
		}

		const project = await this.projectRepository.findById(request.projectId);

		if (!project) {
			throw new NotFoundError({
				message: `Project with id ${request.projectId} not found`,
				resourceType: "Project",
				resourceId: request.projectId,
				trace: "CreateTaskService.execute",
			});
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

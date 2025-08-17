import { inject, injectable } from "tsyringe";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";
import { Task } from "@/task/domain";
import type { TaskRepository } from "@/task/infra";

export type GetTaskServiceParams = { id: EntityId };

export type GetTaskServiceResponse = Task;

@injectable()
export class GetTaskService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
	) {}

	async execute(params: GetTaskServiceParams): Promise<GetTaskServiceResponse> {
		const cacheKey = CacheKeys.task(params.id);

		const cachedTask = await this.cacheProvider.get<Task>(cacheKey);

		if (cachedTask) return Task.fromJSON(cachedTask);

		const task = await this.taskRepository.findById(params.id);

		if (!task) throw NotFoundError.task(params.id);

		const taskResponse = Task.fromJSON({
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			projectId: task.projectId,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		});

		const tenMinutesInSeconds = 600;

		await this.cacheProvider.set(
			cacheKey,
			taskResponse.toJSON(),
			tenMinutesInSeconds,
		);

		return taskResponse;
	}
}

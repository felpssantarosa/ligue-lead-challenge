import { inject, injectable } from "tsyringe";
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
	) {}

	async execute(params: GetTaskServiceParams): Promise<GetTaskServiceResponse> {
		const task = await this.taskRepository.findById(params.id);

		if (!task) throw NotFoundError.task(params.id);

		return Task.fromJSON({
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			projectId: task.projectId,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		});
	}
}

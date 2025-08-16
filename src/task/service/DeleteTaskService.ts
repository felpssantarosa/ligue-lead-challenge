import { inject, injectable } from "tsyringe";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";

export type DeleteTaskServiceParams = {
	id: EntityId;
};

export type DeleteTaskServiceResponse = undefined;

@injectable()
export class DeleteTaskService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
	) {}

	async execute(
		params: DeleteTaskServiceParams,
	): Promise<DeleteTaskServiceResponse> {
		const task = await this.taskRepository.findById(params.id);

		if (!task) throw NotFoundError.task(params.id);

		await this.taskRepository.delete(params.id);
	}
}

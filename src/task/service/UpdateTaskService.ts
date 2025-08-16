import { inject, injectable } from "tsyringe";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";

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

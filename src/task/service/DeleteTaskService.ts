import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra";

export type DeleteTaskServiceParams = {
	id: EntityId;
};

export type DeleteTaskServiceResponse = undefined;

@injectable()
export class DeleteTaskService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
	) {}

	async execute(
		params: DeleteTaskServiceParams,
	): Promise<DeleteTaskServiceResponse> {
		const task = await this.taskRepository.findById(params.id);

		if (!task) throw NotFoundError.task(params.id);

		const project = await this.projectRepository.findById(task.projectId);

		if (!project) throw NotFoundError.project(task.projectId);

		project.updateTaskIds(project.taskIds.filter((id) => id !== task.id));

		await this.projectRepository.update(project);
		await this.taskRepository.delete(params.id);
	}
}

import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
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

		project.updateTaskIds([...project.taskIds, savedTask.id]);

		await this.projectRepository.update(project);

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

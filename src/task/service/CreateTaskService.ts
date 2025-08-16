import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import type { EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { Task } from "@/task/domain/Task";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";

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

		if (!project) throw new Error("Project not found");

		const task = Task.create({
			title: request.title,
			description: request.description,
			status: request.status,
			projectId: request.projectId,
		});

		const savedTask = await this.taskRepository.save(task);

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

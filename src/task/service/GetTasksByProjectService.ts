import { inject, injectable } from "tsyringe";
import type { GetProjectService } from "@/project/service/GetProjectService";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";

export type GetTasksByProjectServiceParams = {
	projectId: EntityId;
};

export type GetTasksByProjectServiceResponse = {
	tasks: Array<{
		id: string;
		title: string;
		description: string;
		status: string;
		projectId: string;
		createdAt: Date;
		updatedAt: Date;
	}>;
	projectId: string;
};

@injectable()
export class GetTasksByProjectService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("GetProjectService")
		private readonly projectService: GetProjectService,
	) {}

	async execute(
		params: GetTasksByProjectServiceParams,
	): Promise<GetTasksByProjectServiceResponse> {
		const project = await this.projectService.execute({ id: params.projectId });

		if (!project) {
			throw new NotFoundError({
				message: `Project with id ${params.projectId} not found`,
				resourceType: "Project",
				resourceId: params.projectId,
			});
		}

		if (params.projectId !== project.id) {
			throw new ApplicationError({
				message: `[CRITICAL] Expected project ID ${params.projectId} but got ${project.id}`,
				trace: "GetTasksByProjectService.execute",
			});
		}

		const tasks = await this.taskRepository.findByProjectId(project.id);

		return {
			tasks: tasks.map((task) => ({
				id: task.id,
				title: task.title,
				description: task.description,
				status: task.status,
				projectId: task.projectId,
				createdAt: task.createdAt,
				updatedAt: task.updatedAt,
			})),
			projectId: project.id,
		};
	}
}

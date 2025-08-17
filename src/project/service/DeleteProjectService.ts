import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import type { TaskService } from "@/task/service";

export interface DeleteProjectServiceParams {
	id: EntityId;
	force?: boolean;
}

export interface DeleteProjectServiceResponse {
	id: string;
	message: string;
	deletedAt: Date;
}

@injectable()
export class DeleteProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("CacheProvider")
		private readonly cacheProvider: CacheProvider,
		@inject("TaskService")
		private readonly taskService: TaskService,
	) {}

	async execute(
		request: DeleteProjectServiceParams,
	): Promise<DeleteProjectServiceResponse> {
		try {
			const existingProject = await this.projectRepository.findById(request.id);

			if (!existingProject) {
				throw NotFoundError.project(request.id, "DeleteProjectService.execute");
			}

			await this.taskService.deleteByProjectId(request.id);
			await this.projectRepository.delete(request.id);
			await this.cacheProvider.delete(CacheKeys.project(request.id));
			await this.cacheProvider.deleteByPattern(CacheKeys.allProjectsLists());

			await this.cacheProvider.delete(CacheKeys.tasksByProject(request.id));
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());
			await this.cacheProvider.deleteByPattern(CacheKeys.taskPattern());

			return {
				id: request.id,
				message: "Project deleted successfully",
				deletedAt: new Date(),
			};
		} catch (error) {
			throw new ApplicationError({
				message: `Failed to delete project with id ${request.id}: ${error}`,
				trace: "DeleteProjectService.execute",
			});
		}
	}
}

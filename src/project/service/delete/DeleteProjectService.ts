import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CheckProjectOwnershipService } from "@/project/service";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import {
	ApplicationError,
	NotFoundError,
	UnauthorizedError,
} from "@/shared/Errors";
import type { TaskService } from "@/task/service";
import type { UserService } from "@/user/service";

export interface DeleteProjectServiceParams {
	projectId: EntityId;
	ownerId: EntityId;
	force?: boolean;
}

export interface DeleteProjectServiceResponse {
	projectId: string;
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
		@inject("CheckProjectOwnershipService")
		private readonly checkProjectOwnershipService: CheckProjectOwnershipService,
		@inject("UserService")
		private readonly userService: UserService,
	) {}

	async execute(
		params: DeleteProjectServiceParams,
	): Promise<DeleteProjectServiceResponse> {
		try {
			const existingProject = await this.projectRepository.findById(
				params.projectId,
			);

			if (!existingProject) {
				throw NotFoundError.project(
					params.projectId,
					"DeleteProjectService.execute",
				);
			}

			const existingUser = await this.userService.findById({
				userId: params.ownerId,
			});

			if (!existingUser) {
				throw NotFoundError.user(
					params.ownerId,
					"UpdateProjectService.execute",
				);
			}

			const hasOwnership = await this.checkProjectOwnershipService.execute({
				ownerId: existingUser.id,
				projectId: existingProject.id,
			});

			if (!hasOwnership) {
				throw UnauthorizedError.insufficientPermissions(
					"delete",
					"Project",
					existingUser.id,
					"DeleteProjectService.execute",
				);
			}

			await this.taskService.deleteByProjectId(params.projectId);
			await this.projectRepository.delete(params.projectId);
			await this.cacheProvider.delete(CacheKeys.project(params.projectId));
			await this.cacheProvider.deleteByPattern(CacheKeys.allProjectsLists());

			await this.cacheProvider.delete(
				CacheKeys.tasksByProject(params.projectId),
			);
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksLists());
			await this.cacheProvider.deleteByPattern(CacheKeys.taskPattern());

			return {
				projectId: params.projectId,
				message: "Project deleted successfully",
				deletedAt: new Date(),
			};
		} catch (error) {
			if (error instanceof UnauthorizedError || error instanceof NotFoundError)
				throw error;

			throw new ApplicationError({
				message: `Failed to delete project with id ${params.projectId}: ${error}`,
				trace: "DeleteProjectService.execute",
			});
		}
	}
}

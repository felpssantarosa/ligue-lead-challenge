import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";
import type { Task } from "@/task/domain";
import type { TaskService } from "@/task/service";

export type GetProjectServiceParams = {
	id: EntityId;
};

export type GetProjectServiceResponse = {
	id: string;
	title: string;
	description: string;
	tags: string[];
	tasks: Task[];
	createdAt: Date;
	updatedAt: Date;
} | null;

@injectable()
export class GetProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("TaskService")
		private readonly taskService: TaskService,
		@inject("CacheProvider")
		private readonly cacheProvider: CacheProvider,
	) {}

	async execute(
		params: GetProjectServiceParams,
	): Promise<GetProjectServiceResponse> {
		const cacheKey = CacheKeys.project(params.id);

		const cachedProject =
			await this.cacheProvider.get<GetProjectServiceResponse>(cacheKey);

		if (cachedProject) return cachedProject;

		const project = await this.projectRepository.findById(params.id);

		if (!project) {
			throw NotFoundError.project(params.id, "GetProjectService.execute");
		}

		const tasks = await Promise.all(
			project.taskIds.map((taskId) => this.taskService.get({ id: taskId })),
		);

		const result = {
			id: project.id,
			title: project.title,
			description: project.description,
			tags: project.tags,
			tasks,
			githubRepositories: project.githubRepositories,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt,
		};

		const tenMinutesInSeconds = 600;

		await this.cacheProvider.set(cacheKey, result, tenMinutesInSeconds);

		return result;
	}
}

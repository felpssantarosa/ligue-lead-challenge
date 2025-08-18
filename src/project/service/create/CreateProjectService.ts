import { inject, injectable } from "tsyringe";
import { Project } from "@/project/domain";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import { NotFoundError } from "@/shared/Errors";
import type { UserService } from "@/user";

export interface CreateProjectServiceParams {
	title: string;
	description: string;
	tags: string[];
	ownerId: string;
}

export interface CreateProjectServiceResponse {
	id: string;
	title: string;
	description: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

@injectable()
export class CreateProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("CacheProvider")
		private readonly cacheProvider: CacheProvider,
		@inject("UserService")
		private readonly userService: UserService,
	) {}

	async execute(
		params: CreateProjectServiceParams,
	): Promise<CreateProjectServiceResponse> {
		// Validate title
		if (!params.title || !params.title.trim()) {
			throw new Error("Project title cannot be empty");
		}

		const existingUser = await this.userService.findById({
			userId: params.ownerId,
		});

		if (!existingUser) {
			throw NotFoundError.user(params.ownerId, "UpdateProjectService.execute");
		}

		const project = Project.create({
			title: params.title,
			description: params.description,
			tags: params.tags || [],
			ownerId: params.ownerId,
		});

		const savedProject = await this.projectRepository.save(project);

		await this.cacheProvider.deleteByPattern(CacheKeys.allProjectsLists());

		return {
			id: savedProject.id,
			title: savedProject.title,
			description: savedProject.description,
			tags: savedProject.tags,
			createdAt: savedProject.createdAt,
			updatedAt: savedProject.updatedAt,
		};
	}
}

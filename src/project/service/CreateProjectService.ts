import { inject, injectable } from "tsyringe";
import { Project } from "@/project/domain/Project";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";

export interface CreateProjectRequest {
	title: string;
	description: string;
	tags: string[];
}

export interface CreateProjectResponse {
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
	) {}

	async execute(request: CreateProjectRequest): Promise<CreateProjectResponse> {
		if (!request.title.trim()) {
			throw new Error("Project title cannot be empty");
		}

		const project = Project.create({
			title: request.title,
			description: request.description,
			tags: request.tags || [],
		});

		const savedProject = await this.projectRepository.save(project);

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

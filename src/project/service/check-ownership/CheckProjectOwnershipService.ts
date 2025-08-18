import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import { NotFoundError } from "@/shared/Errors";

export type CheckProjectOwnershipParams = {
	projectId: string;
	ownerId: string;
};

export type CheckProjectOwnershipResponse = boolean;

@injectable()
export class CheckProjectOwnershipService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
	) {}

	async execute({
		projectId,
		ownerId,
	}: CheckProjectOwnershipParams): Promise<CheckProjectOwnershipResponse> {
		const project = await this.projectRepository.findById(projectId);

		if (!project) throw NotFoundError.project(projectId);

		if (project.ownerId !== ownerId) return false;

		return true;
	}
}

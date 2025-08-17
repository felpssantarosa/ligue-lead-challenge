import type { Project } from "@/project/domain";
import type { EntityId } from "@/shared/domain/Entity";

type PaginationParams = {
	page: number;
	limit: number;
};

type ProjectFilters = {
	tags?: string[];
	search?: string;
};

export type GetAllProjectsParams = PaginationParams & ProjectFilters;

export interface ProjectRepository {
	save(project: Project): Promise<Project>;
	findById(id: EntityId): Promise<Project | null>;
	findAll(params: GetAllProjectsParams): Promise<Project[]>;
	update(project: Project): Promise<Project>;
	delete(id: EntityId): Promise<void>;
}

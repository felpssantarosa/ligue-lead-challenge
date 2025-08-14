import type { Project } from "@/project/domain/Project";
import type { EntityId } from "@/shared/domain/Entity";

export interface ProjectRepository {
	save(project: Project): Promise<Project>;
	findById(id: EntityId): Promise<Project | null>;
	findAll(): Promise<Project[]>;
	update(project: Project): Promise<Project>;
	delete(id: EntityId): Promise<void>;
}

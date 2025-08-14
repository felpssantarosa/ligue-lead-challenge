import type { Project } from "@/project/domain/Project";
import type {
	GetAllProjectsParams,
	ProjectRepository,
} from "@/project/infra/repository/ProjectRepository";
import type { EntityId } from "@/shared/domain/Entity";

export class MockProjectRepository implements ProjectRepository {
	private projects: Map<EntityId, Project> = new Map();

	async save(project: Project): Promise<Project> {
		this.projects.set(project.id, project);
		return project;
	}

	async findById(id: EntityId): Promise<Project | null> {
		return this.projects.get(id) || null;
	}

	async findAll(params: GetAllProjectsParams): Promise<Project[]> {
		const { search, limit, page, tags } = params;

		let projects = Array.from(this.projects.values());

		if (search) {
			projects = projects.filter((project) =>
				project.title.toLowerCase().includes(search.toLowerCase()),
			);
		}

		if (tags && tags.length > 0) {
			projects = projects.filter((project) =>
				project.tags.some((tag) => tags.includes(tag)),
			);
		}

		if (page && limit) {
			const start = (page - 1) * limit;
			const end = start + limit;
			projects = projects.slice(start, end);
		}

		return projects;
	}

	async update(project: Project): Promise<Project> {
		this.projects.set(project.id, project);
		return project;
	}

	async delete(id: EntityId): Promise<void> {
		this.projects.delete(id);
	}

	clear(): void {
		this.projects.clear();
	}
}

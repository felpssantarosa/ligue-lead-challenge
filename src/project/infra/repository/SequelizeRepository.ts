import { Project } from "@/project/domain/Project";
import type { ProjectModel } from "@/project/infra/database/models/Project.model";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";

export class SequelizeRepository implements ProjectRepository {
	private sequelizeModel: typeof ProjectModel;

	constructor(sequelizeModel: typeof ProjectModel) {
		this.sequelizeModel = sequelizeModel;
	}

	async save(project: Project): Promise<Project> {
		const projectData = project.toJSON();
		const savedProject = await this.sequelizeModel.create(projectData);
		return Project.fromJSON(savedProject.toJSON());
	}

	async findById(id: string): Promise<Project | null> {
		const project = await this.sequelizeModel.findByPk(id);
		return project ? Project.fromJSON(project.toJSON()) : null;
	}

	async findAll(): Promise<Project[]> {
		const projects = await this.sequelizeModel.findAll();
		return projects.map((project) => Project.fromJSON(project.toJSON()));
	}

	async update(project: Project): Promise<Project> {
		await this.sequelizeModel.update(project.toJSON(), {
			where: { id: project.id },
		});
		return project;
	}

	async delete(id: string): Promise<void> {
		await this.sequelizeModel.destroy({ where: { id } });
	}
}

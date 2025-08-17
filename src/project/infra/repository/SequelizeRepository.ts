import { Op } from "sequelize";
import { Project } from "@/project/domain";
import type {
	ProjectModel,
	GetAllProjectsParams,
	ProjectRepository,
} from "@/project/infra";

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

	async findAll(params: GetAllProjectsParams): Promise<Project[]> {
		const { page = 1, limit = 10, tags, search } = params;
		const offset = (page - 1) * limit;

		const projects = await this.sequelizeModel.findAll({
			limit,
			offset,
			where: {
				...(tags && tags.length > 0 ? { tags: { [Op.overlap]: tags } } : {}),
				...(search ? { title: { [Op.iLike]: `%${search}%` } } : {}),
			},
		});
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

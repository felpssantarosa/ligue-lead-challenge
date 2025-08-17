import { Op } from "sequelize";
import { Project } from "@/project/domain";
import type { ProjectProps } from "@/project/domain/ProjectDTO";
import type {
	GetAllProjectsParams,
	ProjectModel,
	ProjectRepository,
} from "@/project/infra";
import { ApplicationError } from "@/shared/Errors";

export class SequelizeProjectRepository implements ProjectRepository {
	private sequelizeModel: typeof ProjectModel;

	constructor(sequelizeModel: typeof ProjectModel) {
		this.sequelizeModel = sequelizeModel;
	}

	async save(project: Project): Promise<Project> {
		const projectData = project.toJSON();

		const savedProject = await this.sequelizeModel.create(projectData);

		return this.mapToDomain(savedProject);
	}

	async findById(id: string): Promise<Project | null> {
		const project = await this.sequelizeModel.findByPk(id, {
			include: ["tasks"],
		});

		if (!project) {
			return null;
		}

		return this.mapToDomain(project);
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
			include: ["tasks"],
		});

		return projects.map((project) => {
			return this.mapToDomain(project);
		});
	}

	async update(project: Project): Promise<Project> {
		await this.sequelizeModel.update(project.toJSON(), {
			where: { id: project.id },
		});

		const updatedProject = await this.sequelizeModel.findOne({
			where: { id: project.id },
			include: ["tasks"],
		});

		if (!updatedProject) {
			throw new ApplicationError({
				message: "[CRITICAL] Project not found after updating",
				trace: "SequelizeRepository.update",
			});
		}

		return this.mapToDomain(updatedProject);
	}

	async delete(id: string): Promise<void> {
		await this.sequelizeModel.destroy({ where: { id } });
	}

	private mapToDomain(projectModel: ProjectModel): Project {
		return Project.fromJSON({
			...(projectModel.toJSON() as ProjectProps),
			taskIds: projectModel.tasks
				? projectModel.tasks.map((task) => task.id)
				: [],
		});
	}
}

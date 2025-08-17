import { Op, type WhereOptions } from "sequelize";
import { injectable } from "tsyringe";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError } from "@/shared/Errors";
import { Task } from "@/task/domain";
import {
	type GetAllTasksParams,
	TaskModel,
	type TaskRepository,
} from "@/task/infra";

@injectable()
export class SequelizeTaskRepository implements TaskRepository {
	async save(task: Task): Promise<Task> {
		const taskData = await TaskModel.create({
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			projectId: task.projectId,
		});

		return this.transformIntoTaskInstance(taskData);
	}

	async findById(id: EntityId): Promise<Task | null> {
		const taskData = await TaskModel.findByPk(id);

		if (!taskData) return null;

		return this.transformIntoTaskInstance(taskData);
	}

	async findByProjectId(projectId: EntityId): Promise<Task[]> {
		const tasksData = await TaskModel.findAll({
			where: { projectId },
		});

		return tasksData.map((taskData) =>
			this.transformIntoTaskInstance(taskData),
		);
	}

	async update(task: Task): Promise<Task> {
		await TaskModel.update(
			{
				title: task.title,
				description: task.description,
				status: task.status,
			},
			{
				where: { id: task.id },
			},
		);

		const updatedTask = await this.findById(task.id);

		if (!updatedTask) {
			throw new ApplicationError({
				message: "CRITICAL ERROR: task was not found after the update",
				trace: "SequelizeTaskRepository.update",
			});
		}

		return updatedTask;
	}

	async delete(id: EntityId): Promise<void> {
		await TaskModel.destroy({
			where: { id },
		});
	}

	async findAll(params: GetAllTasksParams): Promise<Array<Task>> {
		const { page = 1, limit = 10, search } = params;

		const where: WhereOptions = {};
		if (search) {
			where.title = {
				[Op.like]: `%${search}%`,
			};
		}

		const offset = (page - 1) * limit;

		const tasks = await TaskModel.findAll({
			where,
			offset,
			limit,
			order: [["createdAt", "DESC"]],
		});

		return tasks.map((task) => this.transformIntoTaskInstance(task));
	}

	private transformIntoTaskInstance(taskModel: TaskModel) {
		return Task.fromJSON({
			id: taskModel.id,
			title: taskModel.title,
			description: taskModel.description,
			status: taskModel.status,
			projectId: taskModel.projectId,
			createdAt: taskModel.createdAt,
			updatedAt: taskModel.updatedAt,
		});
	}
}

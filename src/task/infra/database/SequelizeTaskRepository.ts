import { injectable } from "tsyringe";
import type { EntityId } from "@/shared/domain/Entity";
import { Task } from "@/task/domain/Task";
import type { TaskRepository } from "@/task/domain/TaskRepository";
import { TaskModel } from "@/task/infra/database/models/Task.model";

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

		return Task.restore(
			taskData.id,
			{
				title: taskData.title,
				description: taskData.description,
				status: taskData.status,
				projectId: taskData.projectId,
			},
			taskData.createdAt,
			taskData.updatedAt,
		);
	}

	async findById(id: EntityId): Promise<Task | null> {
		const taskData = await TaskModel.findByPk(id);

		if (!taskData) {
			return null;
		}

		return Task.restore(
			taskData.id,
			{
				title: taskData.title,
				description: taskData.description,
				status: taskData.status,
				projectId: taskData.projectId,
			},
			taskData.createdAt,
			taskData.updatedAt,
		);
	}

	async findByProjectId(projectId: EntityId): Promise<Task[]> {
		const tasksData = await TaskModel.findAll({
			where: { projectId },
		});

		return tasksData.map((taskData) =>
			Task.restore(
				taskData.id,
				{
					title: taskData.title,
					description: taskData.description,
					status: taskData.status,
					projectId: taskData.projectId,
				},
				taskData.createdAt,
				taskData.updatedAt,
			),
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
			throw new Error("Task not found after update");
		}

		return updatedTask;
	}

	async delete(id: EntityId): Promise<void> {
		await TaskModel.destroy({
			where: { id },
		});
	}

	async findAll(): Promise<Task[]> {
		const tasksData = await TaskModel.findAll();

		return tasksData.map((taskData) =>
			Task.restore(
				taskData.id,
				{
					title: taskData.title,
					description: taskData.description,
					status: taskData.status,
					projectId: taskData.projectId,
				},
				taskData.createdAt,
				taskData.updatedAt,
			),
		);
	}
}

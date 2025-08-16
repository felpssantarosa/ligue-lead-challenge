import type { EntityId } from "@/shared/domain/Entity";
import type { Task } from "@/task/domain/Task";
import type {
	GetAllTasksParams,
	TaskRepository,
} from "@/task/infra/repository/TaskRepository";

export class MockTaskRepository implements TaskRepository {
	private tasks: Map<EntityId, Task> = new Map();

	async save(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async findById(id: EntityId): Promise<Task | null> {
		return this.tasks.get(id) || null;
	}

	async findByTaskId(taskId: EntityId): Promise<Task[]> {
		return Array.from(this.tasks.values()).filter((task) => task.id === taskId);
	}

	async update(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async delete(id: EntityId): Promise<void> {
		this.tasks.delete(id);
	}

	async findByProjectId(projectId: EntityId): Promise<Task[]> {
		return Array.from(this.tasks.values()).filter(
			(task) => task.projectId === projectId,
		);
	}

	async findAll(params: GetAllTasksParams): Promise<Task[]> {
		const { search, limit, page } = params;

		let tasks = Array.from(this.tasks.values());

		if (search) {
			tasks = tasks.filter((task) =>
				task.title.toLowerCase().includes(search.toLowerCase()),
			);
		}

		if (page && limit) {
			const start = (page - 1) * limit;
			const end = start + limit;
			tasks = tasks.slice(start, end);
		}

		return tasks;
	}

	clear(): void {
		this.tasks.clear();
	}
}

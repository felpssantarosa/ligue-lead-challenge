import type { EntityId } from "@/shared/domain/Entity";
import type { Task } from "@/task/domain/Task";
import type { TaskRepository } from "@/task/domain/TaskRepository";

export class MockTaskRepository implements TaskRepository {
	private tasks: Map<EntityId, Task> = new Map();

	async save(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async findById(id: EntityId): Promise<Task | null> {
		return this.tasks.get(id) || null;
	}

	async findByProjectId(projectId: EntityId): Promise<Task[]> {
		return Array.from(this.tasks.values()).filter(
			(task) => task.projectId === projectId,
		);
	}

	async update(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async delete(id: EntityId): Promise<void> {
		this.tasks.delete(id);
	}

	async findAll(): Promise<Task[]> {
		return Array.from(this.tasks.values());
	}

	clear(): void {
		this.tasks.clear();
	}
}

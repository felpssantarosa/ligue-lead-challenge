import type { EntityId } from "@/shared/domain/Entity";
import type { Task } from "@/task/domain/Task";

export interface TaskRepository {
	save(task: Task): Promise<Task>;
	findById(id: EntityId): Promise<Task | null>;
	findByProjectId(projectId: EntityId): Promise<Task[]>;
	update(task: Task): Promise<Task>;
	delete(id: EntityId): Promise<void>;
	findAll(): Promise<Task[]>;
}

import type { EntityId } from "@/shared/domain/Entity";
import type { Task } from "@/task/domain/Task";

type PaginationParams = {
	page: number;
	limit: number;
};

type TaskFilters = {
	search?: string;
};

export type GetAllTasksParams = PaginationParams & TaskFilters;

export interface TaskRepository {
	save(task: Task): Promise<Task>;
	findById(id: EntityId): Promise<Task | null>;
	findByProjectId(projectId: EntityId): Promise<Task[]>;
	update(task: Task): Promise<Task>;
	delete(id: EntityId): Promise<void>;
	deleteByProjectId(projectId: EntityId): Promise<void>;
	findAll(params: GetAllTasksParams): Promise<Task[]>;
}

import type { Entity } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";

export type TaskProps = Entity & {
	title: string;
	description: string;
	status: TaskStatus;
	projectId: string;
};

export type CreateTaskParams = Omit<
	TaskProps,
	"id" | "createdAt" | "updatedAt"
>;

export type UpdateTaskParams = Partial<CreateTaskParams>;

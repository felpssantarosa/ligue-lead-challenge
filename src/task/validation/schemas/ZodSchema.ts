import { z } from "zod";
import { TaskStatus } from "@/shared/domain/TaskStatus";

export type TaskValidationId =
	| "create-task"
	| "update-task"
	| "task-id"
	| "create-task-with-project";

const createTaskSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be at most 100 characters")
		.trim(),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional()
		.default(""),
	status: z
		.enum(TaskStatus)
		.optional()
		.default(TaskStatus.TODO)
		.refine((val) => Object.values(TaskStatus).includes(val), {
			message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
		}),
});

const updateTaskSchema = z.object({
	title: z
		.string()
		.min(1, "Title cannot be empty")
		.max(100, "Title must be at most 100 characters")
		.trim()
		.optional(),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional(),
	status: z
		.enum(TaskStatus)
		.optional()
		.refine((val) => !val || Object.values(TaskStatus).includes(val), {
			message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
		}),
});

const taskIdSchema = z.object({
	id: z.uuid("Invalid task ID format").min(1, "Task ID is required"),
});

const createTaskWithProjectSchema = z.object({
	projectId: z
		.uuid("Invalid project ID format")
		.min(1, "Project ID is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type CreateTaskWithProjectInput = z.infer<
	typeof createTaskWithProjectSchema
>;

export const taskSchemas: Record<TaskValidationId, z.ZodSchema> = {
	"create-task": createTaskSchema,
	"update-task": updateTaskSchema,
	"task-id": taskIdSchema,
	"create-task-with-project": createTaskWithProjectSchema,
};

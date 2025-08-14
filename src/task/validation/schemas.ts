import { z } from "zod";
import { TaskStatus } from "@/shared/domain/TaskStatus";

/**
 * Validation schema for creating a task
 */
export const createTaskSchema = z.object({
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

/**
 * Validation schema for updating a task
 */
export const updateTaskSchema = z.object({
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

/**
 * Validation schema for task ID parameter
 */
export const taskIdSchema = z.object({
	id: z.string().uuid("Invalid task ID format").min(1, "Task ID is required"),
});

/**
 * Validation schema for task creation with project ID
 */
export const createTaskWithProjectSchema = z.object({
	projectId: z
		.string()
		.uuid("Invalid project ID format")
		.min(1, "Project ID is required"),
});

/**
 * Type exports for TypeScript
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type CreateTaskWithProjectInput = z.infer<
	typeof createTaskWithProjectSchema
>;

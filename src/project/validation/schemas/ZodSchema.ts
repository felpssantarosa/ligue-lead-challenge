import { z } from "zod";

export type ProjectValidationId =
	| "create-project"
	| "update-project"
	| "project-id"
	| "pagination"
	| "delete-query";

const createProjectSchema = z.object({
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
	tags: z
		.array(z.string().min(1, "Tag cannot be empty"))
		.max(10, "Maximum 10 tags allowed")
		.optional()
		.default([]),
});

const updateProjectSchema = z.object({
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
	tags: z
		.array(z.string().min(1, "Tag cannot be empty"))
		.max(10, "Maximum 10 tags allowed")
		.optional(),
});

const projectIdSchema = z.object({
	id: z.uuid(),
});

const paginationSchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 1))
		.refine((val) => val > 0, "Page must be a positive integer"),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 10))
		.refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
	search: z.string().optional(),
	tags: z
		.string()
		.optional()
		.transform((val) => (val ? val.split(",").map((tag) => tag.trim()) : [])),
});

const deleteQuerySchema = z.object({
	force: z
		.string()
		.optional()
		.transform((val) => val === "true")
		.default(false),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdInput = z.infer<typeof projectIdSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DeleteQueryInput = z.infer<typeof deleteQuerySchema>;

export const projectSchemas: Record<ProjectValidationId, z.ZodSchema> = {
	"create-project": createProjectSchema,
	"update-project": updateProjectSchema,
	"project-id": projectIdSchema,
	pagination: paginationSchema,
	"delete-query": deleteQuerySchema,
};

import type { Entity } from "@/shared/domain/Entity";

export type ProjectProps = Entity & {
	title: string;
	description: string;
	tags: string[];
	taskIds: string[];
};

export type CreateProjectParams = Omit<
	ProjectProps,
	"id" | "createdAt" | "updatedAt" | "taskIds"
>;

export type UpdateProjectParams = Partial<
	Omit<ProjectProps, "id" | "createdAt" | "updatedAt">
>;

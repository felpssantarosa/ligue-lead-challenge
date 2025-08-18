import type { Entity } from "@/shared/domain/Entity";

export type ProjectProps = Entity & {
	title: string;
	description: string;
	tags: string[];
	taskIds: string[];
	ownerId: string;
};

export type CreateProjectParams = Omit<
	ProjectProps,
	"id" | "createdAt" | "updatedAt" | "taskIds"
> & {
	ownerId: string;
};

export type UpdateProjectParams = Partial<
	Omit<ProjectProps, "id" | "createdAt" | "updatedAt">
>;

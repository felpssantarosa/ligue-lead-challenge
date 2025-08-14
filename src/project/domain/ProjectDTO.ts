import type { Entity } from "@/shared/domain/Entity";

export type ProjectProps = Entity & {
	title: string;
	description: string;
	tags: string[];
};

export type CreateProjectParams = Omit<
	ProjectProps,
	"id" | "createdAt" | "updatedAt"
>;

export type UpdateProjectParams = Partial<CreateProjectParams>;

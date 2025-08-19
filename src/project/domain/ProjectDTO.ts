export type GitHubRepository = {
	name: string;
	url: string;
	description: string | null;
	language: string | null;
	starCount: number;
	forkCount: number;
};

export interface ProjectProps {
	id: string;
	title: string;
	description: string;
	tags: string[];
	taskIds: string[];
	ownerId: string;
	githubRepositories: GitHubRepository[];
	createdAt: Date;
	updatedAt: Date;
}

export type CreateProjectParams = Omit<
	ProjectProps,
	"id" | "createdAt" | "updatedAt" | "taskIds"
> & {
	ownerId: string;
};

export type UpdateProjectParams = Partial<
	Omit<ProjectProps, "id" | "createdAt" | "updatedAt">
>;

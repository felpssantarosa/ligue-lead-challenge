import { createHash } from "node:crypto";

type ListParams = {
	page: number;
	limit: number;
	filters?: Record<string, unknown>;
};

const PREFIX = "ligue-lead";
const SEPARATOR = ":";

function hashString(str: string): string {
	const hash = createHash("md5");

	hash.update(str);

	return hash.digest("hex");
}

export const CacheKeys = {
	project: (id: string): string => {
		return `${PREFIX}${SEPARATOR}project${SEPARATOR}${id}`;
	},
	allProjects: (): string => {
		return `${PREFIX}${SEPARATOR}project${SEPARATOR}*`;
	},
	projectsList: (params: ListParams): string => {
		const { page, limit, filters } = params;

		const filterString = filters ? JSON.stringify(filters) : "no-filters";

		const hash = hashString(filterString);

		return `${PREFIX}${SEPARATOR}projects${SEPARATOR}list${SEPARATOR}p${page}_l${limit}_${hash}`;
	},
	allProjectsLists: (): string => {
		return `${PREFIX}${SEPARATOR}projects${SEPARATOR}list${SEPARATOR}*`;
	},
	task: (id: string): string => {
		return `${PREFIX}${SEPARATOR}task${SEPARATOR}${id}`;
	},
	allTasks: (): string => {
		return `${PREFIX}${SEPARATOR}task${SEPARATOR}*`;
	},
	tasksByProject: (projectId: string): string => {
		return `${PREFIX}${SEPARATOR}tasks${SEPARATOR}project${SEPARATOR}${projectId}`;
	},
	allTasksByProject: (): string => {
		return `${PREFIX}${SEPARATOR}tasks${SEPARATOR}project${SEPARATOR}*`;
	},
	tasksList: (params: ListParams): string => {
		const { page, limit, filters } = params;

		const filterString = filters ? JSON.stringify(filters) : "no-filters";

		const hash = hashString(filterString);

		return `${PREFIX}${SEPARATOR}tasks${SEPARATOR}list${SEPARATOR}p${page}_l${limit}_${hash}`;
	},
	allTasksLists: (): string => {
		return `${PREFIX}${SEPARATOR}tasks${SEPARATOR}list${SEPARATOR}*`;
	},
	taskPattern: (): string => {
		return `${PREFIX}${SEPARATOR}task${SEPARATOR}*`;
	},
	githubRepositories: (username: string): string => {
		return `${PREFIX}${SEPARATOR}github${SEPARATOR}repos${SEPARATOR}${username.toLowerCase()}`;
	},
	allGithubRepositories: (): string => {
		return `${PREFIX}${SEPARATOR}github${SEPARATOR}repos${SEPARATOR}*`;
	},
} as const;

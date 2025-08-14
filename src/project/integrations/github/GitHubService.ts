export interface GitHubService {
	getUserRepositories(username: string): Promise<GitHubRepository[]>;
}

export interface GitHubRepository {
	name: string;
	url: string;
	description: string | null;
	language: string | null;
	starCount: number;
	forkCount: number;
}

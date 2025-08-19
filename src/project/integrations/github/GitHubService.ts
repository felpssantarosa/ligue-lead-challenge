import axios from "axios";
import { inject, injectable } from "tsyringe";
import { config } from "@/config/environment";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import { ExternalServiceError, NotFoundError } from "@/shared/Errors";

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

interface GitHubApiRepository {
	name: string;
	html_url: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
}

@injectable()
export class GitHubServiceImpl implements GitHubService {
	private readonly baseUrl: string;
	private readonly cacheTTL = 600; // 10 minutes in seconds

	constructor(
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
	) {
		this.baseUrl = config.github.apiUrl;
	}

	async getUserRepositories(username: string): Promise<GitHubRepository[]> {
		const cacheKey = CacheKeys.githubRepositories(username);

		try {
			const cachedRepositories =
				await this.cacheProvider.get<GitHubRepository[]>(cacheKey);
			if (cachedRepositories) {
				return cachedRepositories;
			}
		} catch (error) {
			console.warn("Cache get error:", error);
		}

		try {
			const response = await axios.get<GitHubApiRepository[]>(
				`${this.baseUrl}/users/${username}/repos`,
				{
					params: {
						sort: "updated",
						per_page: 5,
						type: "public",
					},
					timeout: 10000,
					headers: {
						"User-Agent": "ligue-lead-challenge/1.0.0",
						Accept: "application/vnd.github.v3+json",
					},
				},
			);

			const repositories = response.data.map((repo) => ({
				name: repo.name,
				url: repo.html_url,
				description: repo.description,
				language: repo.language,
				starCount: repo.stargazers_count,
				forkCount: repo.forks_count,
			}));

			try {
				await this.cacheProvider.set(cacheKey, repositories, this.cacheTTL);
			} catch (error) {
				console.warn("Cache set error:", error);
			}

			return repositories;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 404) {
					throw NotFoundError.resource(
						"GitHub User",
						username,
						"GitHubService.getUserRepositories",
					);
				}

				throw ExternalServiceError.githubApiError(
					"fetching user repositories",
					error.response?.status || 500,
					error.message,
				);
			}

			throw ExternalServiceError.githubApiError(
				"fetching user repositories",
				500,
				error instanceof Error ? error.message : "Unknown error occurred",
			);
		}
	}
}

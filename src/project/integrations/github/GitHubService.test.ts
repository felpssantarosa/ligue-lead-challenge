import axios from "axios";
import { GitHubServiceImpl } from "@/project/integrations/github/GitHubService";
import type { CacheProvider } from "@/shared/cache";
import { ExternalServiceError, NotFoundError } from "@/shared/Errors";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCacheProvider = {
	get: jest.fn(),
	set: jest.fn(),
	delete: jest.fn(),
	exists: jest.fn(),
	clear: jest.fn(),
	deleteByPattern: jest.fn(),
	getTtl: jest.fn(),
} as jest.Mocked<CacheProvider>;

describe("GitHubServiceImpl", () => {
	let gitHubService: GitHubServiceImpl;

	beforeEach(() => {
		gitHubService = new GitHubServiceImpl(mockCacheProvider);
		jest.clearAllMocks();
	});

	describe("getUserRepositories", () => {
		const username = "testuser";
		const apiResponse = [
			{
				name: "repo1",
				html_url: "https://github.com/testuser/repo1",
				description: "Test repository 1",
				language: "TypeScript",
				stargazers_count: 15,
				forks_count: 3,
			},
			{
				name: "repo2",
				html_url: "https://github.com/testuser/repo2",
				description: null,
				language: "JavaScript",
				stargazers_count: 8,
				forks_count: 1,
			},
		];

		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should successfully fetch GitHub repositories", async () => {
			mockCacheProvider.get.mockResolvedValue(null);
			mockedAxios.get.mockResolvedValue({ data: apiResponse });

			const result = await gitHubService.getUserRepositories(username);

			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				"https://api.github.com/users/testuser/repos",
				{
					headers: {
						"User-Agent": "ligue-lead-challenge/1.0.0",
						Accept: "application/vnd.github.v3+json",
					},
					params: {
						sort: "updated",
						per_page: 5,
						type: "public",
					},
					timeout: 10000,
				},
			);
			expect(mockCacheProvider.set).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
				[
					{
						name: "repo1",
						url: "https://github.com/testuser/repo1",
						description: "Test repository 1",
						language: "TypeScript",
						starCount: 15,
						forkCount: 3,
					},
					{
						name: "repo2",
						url: "https://github.com/testuser/repo2",
						description: null,
						language: "JavaScript",
						starCount: 8,
						forkCount: 1,
					},
				],
				600, // 10 minutes TTL
			);

			expect(result).toEqual([
				{
					name: "repo1",
					url: "https://github.com/testuser/repo1",
					description: "Test repository 1",
					language: "TypeScript",
					starCount: 15,
					forkCount: 3,
				},
				{
					name: "repo2",
					url: "https://github.com/testuser/repo2",
					description: null,
					language: "JavaScript",
					starCount: 8,
					forkCount: 1,
				},
			]);
		});

		it("should handle GitHub API errors", async () => {
			const axiosError = {
				isAxiosError: true,
				response: {
					status: 404,
				},
				message: "User not found",
			};

			mockCacheProvider.get.mockResolvedValue(null);
			mockedAxios.get.mockRejectedValue(axiosError);
			mockedAxios.isAxiosError.mockReturnValue(true);

			await expect(gitHubService.getUserRepositories(username)).rejects.toThrow(
				NotFoundError,
			);
			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockCacheProvider.set).not.toHaveBeenCalled();
		});

		it("should handle GitHub API server errors", async () => {
			const axiosError = {
				isAxiosError: true,
				response: {
					status: 500,
				},
				message: "Internal server error",
			};

			mockCacheProvider.get.mockResolvedValue(null);
			mockedAxios.get.mockRejectedValue(axiosError);
			mockedAxios.isAxiosError.mockReturnValue(true);

			await expect(gitHubService.getUserRepositories(username)).rejects.toThrow(
				ExternalServiceError,
			);
			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockCacheProvider.set).not.toHaveBeenCalled();
		});

		it("should handle non-axios errors", async () => {
			const genericError = new Error("Network error");
			mockCacheProvider.get.mockResolvedValue(null); // No cache hit
			mockedAxios.get.mockRejectedValue(genericError);
			mockedAxios.isAxiosError.mockReturnValue(false);

			await expect(gitHubService.getUserRepositories(username)).rejects.toThrow(
				ExternalServiceError,
			);
			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockCacheProvider.set).not.toHaveBeenCalled();
		});

		it("should handle rate limiting", async () => {
			const rateLimitError = {
				isAxiosError: true,
				response: {
					status: 403,
				},
				message: "Rate limit exceeded",
			};

			mockCacheProvider.get.mockResolvedValue(null); // No cache hit
			mockedAxios.get.mockRejectedValue(rateLimitError);
			mockedAxios.isAxiosError.mockReturnValue(true);

			await expect(gitHubService.getUserRepositories(username)).rejects.toThrow(
				ExternalServiceError,
			);
			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockCacheProvider.set).not.toHaveBeenCalled();
		});

		it("should return cached repositories when cache hit", async () => {
			const cachedRepos = [
				{
					name: "cached-repo",
					url: "https://github.com/testuser/cached-repo",
					description: "Cached repository",
					language: "Python",
					starCount: 10,
					forkCount: 2,
				},
			];
			mockCacheProvider.get.mockResolvedValue(cachedRepos);

			const result = await gitHubService.getUserRepositories(username);

			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockedAxios.get).not.toHaveBeenCalled();
			expect(mockCacheProvider.set).not.toHaveBeenCalled();
			expect(result).toEqual(cachedRepos);
		});

		it("should handle cache provider errors gracefully", async () => {
			mockCacheProvider.get.mockRejectedValue(new Error("Cache error"));
			mockedAxios.get.mockResolvedValue({ data: apiResponse });

			const result = await gitHubService.getUserRepositories(username);

			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser",
			);
			expect(mockedAxios.get).toHaveBeenCalled(); // Should fallback to API
			expect(mockCacheProvider.set).toHaveBeenCalled(); // Should still try to cache
			expect(result).toEqual([
				{
					name: "repo1",
					url: "https://github.com/testuser/repo1",
					description: "Test repository 1",
					language: "TypeScript",
					starCount: 15,
					forkCount: 3,
				},
				{
					name: "repo2",
					url: "https://github.com/testuser/repo2",
					description: null,
					language: "JavaScript",
					starCount: 8,
					forkCount: 1,
				},
			]);
		});

		it("should use lowercase username for cache key", async () => {
			const uppercaseUsername = "TESTUSER";
			mockCacheProvider.get.mockResolvedValue(null);
			mockedAxios.get.mockResolvedValue({ data: apiResponse });

			await gitHubService.getUserRepositories(uppercaseUsername);

			expect(mockCacheProvider.get).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser", // Should be lowercase
			);
			expect(mockCacheProvider.set).toHaveBeenCalledWith(
				"ligue-lead:github:repos:testuser", // Should be lowercase
				expect.any(Array),
				600,
			);
		});
	});
});

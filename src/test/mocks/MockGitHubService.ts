import type {
	GitHubRepository,
	GitHubService,
} from "@/project/integrations/github/GitHubService";

export class MockGitHubService implements GitHubService {
	async getUserRepositories(username: string): Promise<GitHubRepository[]> {
		const mockRepos: Record<string, GitHubRepository[]> = {
			johndoe: [
				{
					name: "ecommerce-frontend",
					url: "https://github.com/johndoe/ecommerce-frontend",
					description: "React.js frontend for the e-commerce platform",
					language: "TypeScript",
					starCount: 25,
					forkCount: 8,
				},
				{
					name: "ecommerce-backend",
					url: "https://github.com/johndoe/ecommerce-backend",
					description: "Node.js backend API for the e-commerce platform",
					language: "TypeScript",
					starCount: 18,
					forkCount: 5,
				},
			],
			janesmith: [
				{
					name: "lms-core",
					url: "https://github.com/janesmith/lms-core",
					description: "Core learning management system built with Vue.js",
					language: "JavaScript",
					starCount: 92,
					forkCount: 24,
				},
			],
			bobwilson: [
				{
					name: "ai-content-generator",
					url: "https://github.com/bobwilson/ai-content-generator",
					description: "AI-powered content generation using transformer models",
					language: "Python",
					starCount: 156,
					forkCount: 34,
				},
			],
		};

		return mockRepos[username] || [];
	}
}

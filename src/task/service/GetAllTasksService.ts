import { inject, injectable } from "tsyringe";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { Task } from "@/task/domain";
import type { TaskRepository } from "@/task/infra";

export interface GetAllTasksServiceParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface GetAllTasksServiceResponse {
	tasks: Array<Task>;
	total: number;
	page: number;
	limit: number;
}

@injectable()
export class GetAllTasksService {
	constructor(
		@inject("TaskRepository") private readonly taskRepository: TaskRepository,
		@inject("CacheProvider") private readonly cacheProvider: CacheProvider,
	) {}

	async execute(
		params: GetAllTasksServiceParams = {},
	): Promise<GetAllTasksServiceResponse> {
		const { page = 1, limit = 10, search } = params;
		const filters = { search };

		const cacheKey = CacheKeys.tasksList({ page, limit, filters });

		const cachedResult =
			await this.cacheProvider.get<GetAllTasksServiceResponse>(cacheKey);

		if (cachedResult) return cachedResult;

		const tasks = await this.taskRepository.findAll({
			limit,
			page,
			search,
		});

		const total = tasks.length;

		const result = {
			tasks,
			total,
			page,
			limit,
		};

		const TenMinutesInSeconds = 600;

		await this.cacheProvider.set(cacheKey, result, TenMinutesInSeconds);

		return result;
	}
}

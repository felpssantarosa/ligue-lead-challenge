import { inject, injectable } from "tsyringe";
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
	) {}

	async execute(
		params: GetAllTasksServiceParams = {},
	): Promise<GetAllTasksServiceResponse> {
		const { page = 1, limit = 10, search } = params;

		const tasks = await this.taskRepository.findAll({
			limit,
			page,
			search,
		});

		const total = tasks.length;

		return {
			tasks,
			total,
			page,
			limit,
		};
	}
}

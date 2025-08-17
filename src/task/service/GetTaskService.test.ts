import { NotFoundError } from "@/shared/Errors";
import { GetTaskService } from "@/task/service";
import { generateUUID } from "@/test/factories";
import {
	createTask,
	MockCacheProvider,
	mockTaskRepository,
} from "@/test/mocks";

describe("GetTaskService", () => {
	let getTaskService: GetTaskService;
	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");

	beforeEach(() => {
		getTaskService = new GetTaskService(
			mockTaskRepository,
			new MockCacheProvider(),
		);
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should return task when found", async () => {
			const taskId = generateUUID();
			const task = createTask({ id: taskId });

			findByIdSpy.mockResolvedValue(task);

			const result = await getTaskService.execute({ id: taskId });

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(result).toEqual(task);
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			await expect(getTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);
			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
		});
	});
});

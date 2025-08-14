import { BusinessRuleError } from "@/shared/Errors";

describe("BusinessRuleError", () => {
	it("should create a business rule error for project limit", () => {
		const error = BusinessRuleError.projectLimitExceeded(5, 3, "user123");

		expect(error.name).toBe("BusinessRuleError");
		expect(error.httpCode).toBe(422);
		expect(error.rule).toBe("PROJECT_LIMIT_EXCEEDED");
		expect(error.context).toEqual({
			currentCount: 5,
			maxAllowed: 3,
			userId: "user123",
		});
	});

	it("should create a business rule error for invalid status transition", () => {
		const error = BusinessRuleError.taskStatusTransitionNotAllowed(
			"COMPLETED",
			"TODO",
			"task123",
		);

		expect(error.rule).toBe("INVALID_STATUS_TRANSITION");
		expect(error.context).toEqual({
			fromStatus: "COMPLETED",
			toStatus: "TODO",
			taskId: "task123",
		});
	});
});

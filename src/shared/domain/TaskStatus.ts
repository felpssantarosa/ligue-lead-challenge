export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	DONE = "done",
}

export const isValidTaskStatus = (status: string): status is TaskStatus => {
	return Object.values(TaskStatus).includes(status as TaskStatus);
};

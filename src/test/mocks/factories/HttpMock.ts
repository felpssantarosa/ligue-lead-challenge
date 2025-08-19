import type { Response } from "express";

export const mockRequest = {
	body: {},
	params: {},
	query: {},
	user: {
		id: "test-user-id",
		email: "test@example.com",
		name: "Test User",
	},
};

export const mockResponse: Partial<Response> = {
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
};

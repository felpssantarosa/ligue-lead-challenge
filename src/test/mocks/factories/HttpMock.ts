import type { Response } from "express";

export const mockRequest = {
	body: {},
	params: {},
	query: {},
};

export const mockResponse: Partial<Response> = {
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
};

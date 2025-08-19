import swaggerJsdoc from "swagger-jsdoc";
import { config } from "@/config/environment";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Ligue Lead Challenge API",
			version: "1.0.0",
			description:
				"API for project and task management with user authentication",
			contact: {
				name: "API Support",
				email: "support@example.com",
			},
		},
		servers: [
			{
				url: `http://localhost:${config.port}`,
				description: "Development server",
			},
			{
				url: "https://api.example.com",
				description: "Production server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				Project: {
					type: "object",
					required: ["title", "description", "status"],
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "Unique identifier for the project",
						},
						title: {
							type: "string",
							description: "Project title",
							example: "E-commerce Platform",
						},
						description: {
							type: "string",
							description: "Project description",
							example:
								"A modern e-commerce platform built with React and Node.js",
						},
						status: {
							type: "string",
							enum: ["active", "completed", "paused"],
							description: "Project status",
						},
						tags: {
							type: "array",
							items: {
								type: "string",
							},
							description: "Project tags",
							example: ["react", "nodejs", "ecommerce"],
						},
						githubUrl: {
							type: "string",
							format: "uri",
							description: "GitHub repository URL",
							example: "https://github.com/user/project",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Creation timestamp",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Last update timestamp",
						},
					},
				},
				Task: {
					type: "object",
					required: ["title", "description", "status"],
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "Unique identifier for the task",
						},
						title: {
							type: "string",
							description: "Task title",
							example: "Implement user authentication",
						},
						description: {
							type: "string",
							description: "Task description",
							example: "Create JWT-based authentication system",
						},
						status: {
							type: "string",
							enum: ["todo", "in_progress", "done"],
							description: "Task status",
						},
						projectId: {
							type: "string",
							format: "uuid",
							description: "Associated project ID",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Creation timestamp",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Last update timestamp",
						},
					},
				},
				User: {
					type: "object",
					required: ["email", "password"],
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "Unique identifier for the user",
						},
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						password: {
							type: "string",
							format: "password",
							description: "User password (hashed in storage)",
							example: "securePassword123",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Creation timestamp",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Last update timestamp",
						},
					},
				},
				ApiResponse: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							description: "Indicates if the request was successful",
						},
						data: {
							description: "Response data",
						},
						meta: {
							type: "object",
							properties: {
								total: {
									type: "number",
									description: "Total number of items",
								},
								page: {
									type: "number",
									description: "Current page number",
								},
								limit: {
									type: "number",
									description: "Items per page",
								},
								hasNextPage: {
									type: "boolean",
									description: "Whether there are more pages",
								},
							},
						},
					},
				},
				ErrorResponse: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: false,
						},
						error: {
							type: "object",
							properties: {
								type: {
									type: "string",
									description: "Error type",
								},
								message: {
									type: "string",
									description: "Error message",
								},
								field: {
									type: "string",
									description: "Field that caused validation error",
								},
								value: {
									description: "Invalid value",
								},
							},
						},
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: [
		"./src/**/*.ts", // Path to the API files
		"./src/**/**/*.ts",
	],
};

export const specs = swaggerJsdoc(options);

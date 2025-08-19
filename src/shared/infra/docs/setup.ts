import { apiReference } from "@scalar/express-api-reference";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";

export const setupApiDocumentation = (app: Express): void => {
	app.get("/api/openapi.json", (_, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(specs);
	});

	app.use(
		"/api/docs",
		apiReference({
			theme: "default",
			content: specs,
			metaData: {
				title: "Ligue Lead Challenge API Documentation",
				description:
					"Interactive API documentation for the project and task management platform",
			},
			searchHotKey: "k",
		}),
	);

	app.use(
		"/api/docs-swagger",
		swaggerUi.serve,
		swaggerUi.setup(specs, {
			customSiteTitle: "Ligue Lead Challenge API",
			customfavIcon: "/favicon.ico",
			customCss: `
			.topbar { display: none; }
			.swagger-ui .topbar { display: none; }
		`,
			swaggerOptions: {
				persistAuthorization: true,
				displayRequestDuration: true,
				filter: true,
				tryItOutEnabled: true,
			},
		}),
	);

	app.get("/api/docs/openapi.json", (_, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(specs);
	});

	console.log("📚 API Documentation configured:");
	console.log("  • Scalar UI: /api/docs");
	console.log("  • Swagger UI: /api/docs-swagger");
	console.log("  • OpenAPI JSON: /api/openapi.json");
};

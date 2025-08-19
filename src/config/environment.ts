import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV || "development",
	database: {
		host: process.env.DB_HOST || "localhost",
		port: parseInt(process.env.DB_PORT || "3306"),
		name: process.env.DB_NAME || "ligue_lead_challenge",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASS || "password",
	},
	redis: {
		host: process.env.REDIS_HOST || "localhost",
		port: parseInt(process.env.REDIS_PORT || "6379"),
	},
	github: {
		apiUrl: process.env.GITHUB_API_URL || "https://api.github.com",
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},
	cors: {
		origin: process.env.CORS_ORIGIN || "*",
		credentials: process.env.CORS_CREDENTIALS === "true" || false,
		methods:
			process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		allowedHeaders:
			process.env.CORS_ALLOWED_HEADERS ||
			"Content-Type,Authorization,X-Requested-With",
		preflightContinue: false,
		optionsSuccessStatus: 204,
	},
} as const;

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
} as const;

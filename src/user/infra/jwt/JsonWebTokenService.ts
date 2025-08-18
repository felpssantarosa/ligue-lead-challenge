import type { SignOptions } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { ApplicationError } from "@/shared/Errors";
import type { JwtService } from "@/user/infra/jwt/JwtService";

@injectable()
export class JsonWebTokenService implements JwtService {
	private readonly secret: string;
	private readonly expiresIn: string;

	constructor() {
		const jwtSecret = process.env.JWT_SECRET;

		if (!jwtSecret) {
			throw new ApplicationError({
				message: "JWT_SECRET was not found in your environment",
				trace: "JsonWebTokenService.constructor",
			});
		}

		this.secret = jwtSecret;
		this.expiresIn = process.env.JWT_EXPIRES_IN || "24h";
	}

	generateToken(payload: object): string {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.expiresIn,
		} as SignOptions);
	}

	verifyToken(token: string): jwt.JwtPayload | null {
		try {
			return jwt.verify(token, this.secret) as jwt.JwtPayload;
		} catch {
			return null;
		}
	}
}

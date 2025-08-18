import type { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { UnauthorizedError } from "@/shared/Errors";
import type { AuthUserService } from "@/user/service";

export interface AuthenticatedRequest extends Request {
	user: {
		id: string;
		email: string;
		name: string;
	};
}

export const authMiddleware = async (
	request: Request,
	response: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedError({
				message: "Missing authorization header",
				action: "authenticate",
				resource: "User",
			});
		}

		if (!authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError({
				message: "Invalid authorization header",
				action: "authenticate",
				resource: "User",
			});
		}

		const tokenWithoutPrefix = authHeader.substring(7);

		const authService = container.resolve<AuthUserService>("AuthUserService");
		const user = await authService.validateToken(tokenWithoutPrefix);

		(request as AuthenticatedRequest).user = {
			id: user.id,
			email: user.email,
			name: user.name,
		};

		next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			response.status(error.httpCode).json({
				success: false,
				error: {
					type: error.type.name,
					message: error.message,
					action: error.action,
					resource: error.resource,
				},
			});

			return;
		}

		response.status(401).json({
			success: false,
			error: {
				type: "UNAUTHORIZED",
				message: "Authentication failed",
			},
		});
	}
};

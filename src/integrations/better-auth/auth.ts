import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	secret: process.env.BETTER_AUTH_SECRET || import.meta.env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Disable email verification for now to allow immediate login
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	baseURL: import.meta.env.VITE_APP_URL || "http://localhost:3000",
	basePath: "/api/auth",
	trustedOrigins: [import.meta.env.VITE_APP_URL || "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;

// Helper to get session from request
export async function getSessionFromRequest(
	request: Request,
): Promise<{ userId: string | null; sessionId: string | null }> {
	try {
		// Try using Better Auth API first
		try {
			const sessionResponse = await auth.api.getSession({
				headers: request.headers,
			});

			if (sessionResponse?.user?.id) {
				// Get session ID from token
				const cookies = request.headers.get("cookie") || "";
				const sessionTokenMatch = cookies.match(
					/(?:better-auth\.)?session_token=([^;]+)/,
				);

				if (sessionTokenMatch) {
					const sessionToken = decodeURIComponent(sessionTokenMatch[1]);
					const session = await prisma.session.findUnique({
						where: { token: sessionToken },
						select: { id: true },
					});

					return {
						userId: sessionResponse.user.id,
						sessionId: session?.id || null,
					};
				}

				return {
					userId: sessionResponse.user.id,
					sessionId: null,
				};
			}
		} catch (apiError) {
			if (import.meta.env.DEV) {
				console.log(
					"[Better Auth] API method failed, trying cookie method:",
					apiError,
				);
			}
		}

		// Fallback: Get session token from cookie
		const cookies = request.headers.get("cookie") || "";

		// Better Auth uses different cookie name patterns
		let sessionToken: string | null = null;

		// Try all possible cookie patterns
		const patterns = [
			/better-auth\.session_token=([^;]+)/,
			/session_token=([^;]+)/,
			/better-auth\.session=([^;]+)/,
			/session=([^;]+)/,
		];

		for (const pattern of patterns) {
			const match = cookies.match(pattern);
			if (match) {
				sessionToken = decodeURIComponent(match[1]);
				break;
			}
		}

		if (!sessionToken) {
			return { userId: null, sessionId: null };
		}

		// Get session from database
		const session = await prisma.session.findUnique({
			where: { token: sessionToken },
			select: { id: true, userId: true },
		});

		if (session) {
			return {
				userId: session.userId,
				sessionId: session.id,
			};
		} else {
			if (import.meta.env.DEV) {
				console.log("[Better Auth] Session not found in database for token");
			}
		}
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error("[Better Auth] Error getting session:", error);
		}
	}

	return { userId: null, sessionId: null };
}

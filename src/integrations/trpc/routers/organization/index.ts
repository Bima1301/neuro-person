import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { protectedProcedure, publicProcedure } from "../../init";
import { organizationCreateInput, organizationUpdateInput } from "./validation";

export const organizationRouter = {
	// Check if user has organization and get role (public - no org required)
	checkUserOrg: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ input }) => {
			const user = await prisma.user.findUnique({
				where: { id: input.userId },
				select: {
					id: true,
					organizationId: true,
					role: true,
					email: true,
					employee: {
						select: {
							id: true,
							status: true,
						},
					},
				},
			});

			return {
				hasOrganization: !!user?.organizationId,
				userId: user?.id || null,
				role: user?.role || null,
				isEmployee: !!user?.employee,
				employeeStatus: user?.employee?.status || null,
			};
		}),

	// Validate employee email before login (public - no auth required)
	validateEmployeeEmail: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ input }) => {
			// Check if email exists in employee table
			const employee = await prisma.employee.findFirst({
				where: {
					email: input.email,
					status: "ACTIVE",
				},
				select: {
					id: true,
					email: true,
					status: true,
					organizationId: true,
					user: {
						select: {
							id: true,
							role: true,
						},
					},
				},
			});

			if (!employee) {
				return {
					isValid: false,
					reason: "Email tidak terdaftar sebagai karyawan aktif",
				};
			}

			// Check if user has EMPLOYEE role
			if (employee.user?.role !== "EMPLOYEE") {
				return {
					isValid: false,
					reason: "Email ini tidak memiliki akses ke portal karyawan",
				};
			}

			return {
				isValid: true,
				email: employee.email,
				employeeId: employee.id,
				organizationId: employee.organizationId,
			};
		}),

	// Validate employee username or email before login (public - no auth required)
	validateEmployeeIdentifier: publicProcedure
		.input(z.object({ identifier: z.string() })) // Can be username or email
		.query(async ({ input }) => {
			// Check if identifier is email or username
			const isEmail = input.identifier.includes("@");

			let employee: {
				id: string;
				email: string;
				username: string | null;
				status: string;
				organizationId: string;
				user: {
					id: string;
					role: string;
				} | null;
			} | null = null;

			if (isEmail) {
				// Search by email
				employee = await prisma.employee.findFirst({
					where: {
						email: input.identifier,
						status: "ACTIVE",
					},
					select: {
						id: true,
						email: true,
						username: true,
						status: true,
						organizationId: true,
						user: {
							select: {
								id: true,
								role: true,
							},
						},
					},
				});
			} else {
				// Search by username
				employee = await prisma.employee.findFirst({
					where: {
						username: input.identifier,
						status: "ACTIVE",
					},
					select: {
						id: true,
						email: true,
						username: true,
						status: true,
						organizationId: true,
						user: {
							select: {
								id: true,
								role: true,
							},
						},
					},
				});
			}

			if (!employee) {
				return {
					isValid: false,
					reason: isEmail
						? "Email tidak terdaftar sebagai karyawan aktif"
						: "Username tidak terdaftar sebagai karyawan aktif",
				};
			}

			// Check if user has EMPLOYEE role
			if (employee.user?.role !== "EMPLOYEE") {
				return {
					isValid: false,
					reason: "Akun ini tidak memiliki akses ke portal karyawan",
				};
			}

			return {
				isValid: true,
				email: employee.email,
				username: employee.username,
				employeeId: employee.id,
				organizationId: employee.organizationId,
			};
		}),

	// Check if user is valid employee (for employee portal access)
	checkEmployeeAccess: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ input }) => {
			const user = await prisma.user.findUnique({
				where: { id: input.userId },
				select: {
					id: true,
					email: true,
					role: true,
					organizationId: true,
					employee: {
						select: {
							id: true,
							status: true,
							employeeId: true,
						},
					},
				},
			});

			// User must exist
			if (!user) {
				return {
					isValid: false,
					reason: "User tidak ditemukan di database",
				};
			}

			// User must have organization
			if (!user.organizationId) {
				return {
					isValid: false,
					reason: "User belum memiliki organisasi",
				};
			}

			// User must have EMPLOYEE role
			if (user.role !== "EMPLOYEE") {
				return {
					isValid: false,
					reason: "User bukan karyawan",
				};
			}

			// User must have employee record
			if (!user.employee) {
				return {
					isValid: false,
					reason: "Email tidak terdaftar sebagai karyawan",
				};
			}

			// Employee must be active
			if (user.employee.status !== "ACTIVE") {
				return {
					isValid: false,
					reason: `Karyawan dengan status ${user.employee.status} tidak dapat mengakses portal`,
				};
			}

			return {
				isValid: true,
				userId: user.id,
				employeeId: user.employee.id,
				organizationId: user.organizationId,
			};
		}),

	// Create organization and user (public - for onboarding)
	create: publicProcedure
		.input(organizationCreateInput)
		.mutation(async ({ input }) => {
			// Check if user already exists and has organization
			const existingUser = await prisma.user.findUnique({
				where: { id: input.userId },
				select: { id: true, organizationId: true },
			});

			if (!existingUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User tidak ditemukan",
				});
			}

			if (existingUser.organizationId) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User already has an organization",
				});
			}

			// Check if slug is taken
			const existingOrg = await prisma.organization.findUnique({
				where: { slug: input.organizationSlug },
			});

			if (existingOrg) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Slug sudah digunakan, silakan pilih yang lain",
				});
			}

			// Create organization and user in transaction
			const result = await prisma.$transaction(async (tx) => {
				const organization = await tx.organization.create({
					data: {
						name: input.organizationName,
						slug: input.organizationSlug,
						address: input.address,
						phone: input.phone,
						email: input.email,
						website: input.website,
						geoPolygon: input.geoPolygon,
						geoCenter: input.geoCenter,
						geoRadius: input.geoRadius,
					},
				});

				// Update existing user with organization
				const user = await tx.user.update({
					where: { id: input.userId },
					data: {
						email: input.userEmail,
						name: input.userName,
						role: "ADMIN",
						organizationId: organization.id,
					},
				});

				return { organization, user };
			});

			return result;
		}),

	// Get current organization
	current: protectedProcedure.query(async ({ ctx }) => {
		return await prisma.organization.findUnique({
			where: { id: ctx.organizationId },
		});
	}),

	// Update organization
	update: protectedProcedure
		.input(organizationUpdateInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.organization.update({
				where: { id: ctx.organizationId },
				data: {
					...(input.name && { name: input.name }),
					...(input.address !== undefined && { address: input.address }),
					...(input.phone !== undefined && { phone: input.phone }),
					...(input.email !== undefined && { email: input.email }),
					...(input.website !== undefined && { website: input.website }),
					...(input.logo !== undefined && { logo: input.logo }),
					...(input.geoPolygon !== undefined && {
						geoPolygon:
							input.geoPolygon === null
								? Prisma.JsonNull
								: (input.geoPolygon as Prisma.InputJsonValue),
					}),
					...(input.geoCenter !== undefined && {
						geoCenter:
							input.geoCenter === null
								? Prisma.JsonNull
								: (input.geoCenter as Prisma.InputJsonValue),
					}),
					...(input.geoRadius !== undefined && {
						geoRadius: input.geoRadius,
					}),
				},
			});
		}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";

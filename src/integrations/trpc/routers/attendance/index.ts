import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/db";
import type { EnumAttendanceStatusFilter } from "@/generated/prisma/commonInputTypes";
import {
	normalizeDateToUTC,
	normalizeTodayLocalToUTC,
} from "@/lib/date-utils";
import { protectedProcedure } from "../../init";
import { attendanceCheckInput, attendanceDeleteInput, attendanceInfiniteInput, attendanceListInput } from "./validation";

export const attendanceRouter = {
	list: protectedProcedure
		.input(attendanceListInput)
		.query(async ({ input, ctx }) => {
			const page = input?.page ?? 1;
			const perPage = input?.perPage ?? 10;
			const skip = (page - 1) * perPage;

			const where = {
				organizationId: ctx.organizationId,
				employeeId: input?.employeeId,
				status: input?.status as EnumAttendanceStatusFilter<"Attendance">,
				...(input?.date && {
					date: normalizeDateToUTC(input.date) as unknown as string,
				}),
				...(input?.startDate &&
					input?.endDate && {
						date: {
							gte: normalizeDateToUTC(input.startDate),
							lte: (() => {
								const endDate = normalizeDateToUTC(input.endDate);
								endDate.setUTCHours(23, 59, 59, 999);
								return endDate;
							})(),
						},
					}),
			};

			const [items, total] = await Promise.all([
				prisma.attendance.findMany({
					where,
					include: {
						employee: {
							select: {
								firstName: true,
								lastName: true,
								employeeId: true,
								email: true,
								phone: true,
								address: true,
								city: true,
								gender: true,
								hireDate: true,
								department: {
									select: { name: true },
								},
								position: {
									select: {
										name: true,
										locationPresenceType: true,
										shiftPresenceType: true,
									},
								},
								organization: {
									select: { name: true },
								},
							},
						},
					},
					orderBy: { date: "desc" },
					skip,
					take: perPage,
				}),
				prisma.attendance.count({ where }),
			]);

			// Get shift and attendance type for each attendance
			const itemsWithShift = await Promise.all(
				items.map(async (item) => {
					const employeeShift = await prisma.employeeShift.findFirst({
						where: {
							employeeId: item.employeeId,
							date: item.date,
						},
						include: {
							shift: {
								select: {
									name: true,
									startTime: true,
									endTime: true,
								},
							},
							attendanceType: {
								select: {
									name: true,
									code: true,
									isMustPresence: true,
								},
							},
						},
					});

					return {
						...item,
						shift: employeeShift?.shift || null,
						attendanceType: employeeShift?.attendanceType || null,
					};
				}),
			);

			return {
				items: itemsWithShift,
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage),
			};
		}),

	infinite: protectedProcedure
		.input(attendanceInfiniteInput)
		.query(async ({ input, ctx }) => {
			const limit = input?.limit ?? 10;

			const where = {
				organizationId: ctx.organizationId,
				employeeId: input?.employeeId,
				status: input?.status as EnumAttendanceStatusFilter<"Attendance">,
				...(input?.date && {
					date: normalizeDateToUTC(input.date) as unknown as string,
				}),
				...(input?.startDate &&
					input?.endDate && {
						date: {
							gte: normalizeDateToUTC(input.startDate),
							lte: (() => {
								const endDate = normalizeDateToUTC(input.endDate);
								endDate.setUTCHours(23, 59, 59, 999);
								return endDate;
							})(),
						},
					}),
				...(input?.cursor && {
					id: {
						lt: input.cursor,
					},
				}),
			};

			const items = await prisma.attendance.findMany({
				where,
				include: {
					employee: {
						select: {
							firstName: true,
							lastName: true,
							employeeId: true,
							email: true,
							phone: true,
							address: true,
							city: true,
							gender: true,
							hireDate: true,
							department: {
								select: { name: true },
							},
							position: {
								select: {
									name: true,
									locationPresenceType: true,
									shiftPresenceType: true,
								},
							},
							organization: {
								select: { name: true },
							},
						},
					},
				},
				orderBy: [{ date: "desc" }, { id: "desc" }],
				take: limit + 1,
			});

			let nextCursor: string | undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem?.id;
			}

			const itemsWithShift = await Promise.all(
				items.map(async (item) => {
					const employeeShift = await prisma.employeeShift.findFirst({
						where: {
							employeeId: item.employeeId,
							date: item.date,
						},
						include: {
							shift: {
								select: {
									name: true,
									startTime: true,
									endTime: true,
								},
							},
							attendanceType: {
								select: {
									name: true,
									code: true,
									isMustPresence: true,
								},
							},
						},
					});

					return {
						...item,
						shift: employeeShift?.shift || null,
						attendanceType: employeeShift?.attendanceType || null,
					};
				}),
			);

			return {
				items: itemsWithShift,
				nextCursor,
			};
		}),

	checkIn: protectedProcedure
		.input(attendanceCheckInput)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Get employee from user
			const user = await prisma.user.findUnique({
				where: { id: ctx.userId },
				include: { employee: true },
			});

			if (!user?.employee || user.employee.id !== input.employeeId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Unauthorized access",
				});
			}

			// Check if employee has shift today with mustPresence = true
			// Use local timezone to match user's perception of "today"
			const today = normalizeTodayLocalToUTC();

			const todayShift = await prisma.employeeShift.findFirst({
				where: {
					employeeId: input.employeeId,
					date: today,
				},
				include: {
					attendanceType: true,
				},
			});

			// Validate: Must have shift allocation for today
			if (!todayShift) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Anda tidak memiliki alokasi shift untuk hari ini. Silakan hubungi HR untuk mengatur shift Anda.",
				});
			}

			// Validate: Shift must require presence (isMustPresence = true)
			if (!todayShift.attendanceType.isMustPresence) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Shift hari ini (${todayShift.attendanceType.name}) tidak memerlukan presensi.`,
				});
			}

			const existing = await prisma.attendance.findUnique({
				where: {
					employeeId_date: { employeeId: input.employeeId, date: today },
				},
			});

			if (existing) {
				return await prisma.attendance.update({
					where: { id: existing.id },
					data: {
						checkIn: new Date(),
						checkInPhoto: input.photo,
						checkInNotes: input.notes,
						checkInLat: input.latitude,
						checkInLng: input.longitude,
						status: new Date().getHours() > 9 ? "LATE" : "PRESENT",
					},
				});
			}

			return await prisma.attendance.create({
				data: {
					organizationId: ctx.organizationId,
					employeeId: input.employeeId,
					date: today,
					checkIn: new Date(),
					checkInPhoto: input.photo,
					checkInNotes: input.notes,
					checkInLat: input.latitude,
					checkInLng: input.longitude,
					status: new Date().getHours() > 9 ? "LATE" : "PRESENT",
				},
			});
		}),

	checkOut: protectedProcedure
		.input(attendanceCheckInput)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Get employee from user
			const user = await prisma.user.findUnique({
				where: { id: ctx.userId },
				include: { employee: true },
			});

			if (!user?.employee || user.employee.id !== input.employeeId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Unauthorized access",
				});
			}

			// Determine target date (try today first, then yesterday if no check-in today)
			// Use local timezone to match user's perception of "today"
			const today = normalizeTodayLocalToUTC();
			
			// Check if there's a check-in today
			const todayAttendance = await prisma.attendance.findUnique({
				where: {
					employeeId_date: { employeeId: input.employeeId, date: today },
				},
			});

			let targetDate = today;
			// If no check-in today, try yesterday
			if (!todayAttendance || !todayAttendance.checkIn) {
				// Calculate yesterday based on local timezone
				const yesterday = new Date(today);
				yesterday.setUTCDate(yesterday.getUTCDate() - 1);
				
				const yesterdayAttendance = await prisma.attendance.findUnique({
					where: {
						employeeId_date: { employeeId: input.employeeId, date: yesterday },
					},
				});

				if (yesterdayAttendance && yesterdayAttendance.checkIn && !yesterdayAttendance.checkOut) {
					targetDate = yesterday;
				} else if (!todayAttendance) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Tidak ada record check-in untuk hari ini atau kemarin",
					});
				}
			}

			// Check if employee has shift on target date with mustPresence = true
			const targetShift = await prisma.employeeShift.findFirst({
				where: {
					employeeId: input.employeeId,
					date: targetDate,
				},
				include: {
					attendanceType: true,
				},
			});

			// Validate: Must have shift allocation for target date
			if (!targetShift) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Anda tidak memiliki alokasi shift untuk tanggal ${targetDate.toLocaleDateString("id-ID")}. Silakan hubungi HR untuk mengatur shift Anda.`,
				});
			}

			// Validate: Shift must require presence (isMustPresence = true)
			if (!targetShift.attendanceType.isMustPresence) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Shift pada tanggal tersebut (${targetShift.attendanceType.name}) tidak memerlukan presensi.`,
				});
			}

			// Find attendance record
			const attendance = await prisma.attendance.findUnique({
				where: {
					employeeId_date: { employeeId: input.employeeId, date: targetDate },
				},
			});

			if (!attendance) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tidak ada record check-in untuk tanggal tersebut",
				});
			}

			if (attendance.checkOut) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Sudah melakukan check-out untuk tanggal tersebut",
				});
			}

			return await prisma.attendance.update({
				where: {
					id: attendance.id,
					organizationId: ctx.organizationId,
				},
				data: {
					checkOut: new Date(),
					checkOutPhoto: input.photo,
					checkOutNotes: input.notes,
					checkOutLat: input.latitude,
					checkOutLng: input.longitude,
				},
			});
		}),

	todaySummary: protectedProcedure.query(async ({ ctx }) => {
		const today = normalizeTodayLocalToUTC();

		const [present, late, absent] = await Promise.all([
			prisma.attendance.count({
				where: {
					organizationId: ctx.organizationId,
					date: today,
					status: "PRESENT",
				},
			}),
			prisma.attendance.count({
				where: {
					organizationId: ctx.organizationId,
					date: today,
					status: "LATE",
				},
			}),
			prisma.attendance.count({
				where: {
					organizationId: ctx.organizationId,
					date: today,
					status: "ABSENT",
				},
			}),
		]);

		return { present, late, absent, total: present + late + absent };
	}),

	delete: protectedProcedure
		.input(attendanceDeleteInput)
		.mutation(async ({ input, ctx }) => {
			// Check if attendance exists and belongs to organization
			const attendance = await prisma.attendance.findFirst({
				where: {
					id: input.id,
					organizationId: ctx.organizationId,
				},
			});

			if (!attendance) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Data absensi tidak ditemukan",
				});
			}

			// Delete attendance
			await prisma.attendance.delete({
				where: {
					id: input.id,
					organizationId: ctx.organizationId,
				},
			});

			return { success: true, message: "Data absensi berhasil dihapus" };
		}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";

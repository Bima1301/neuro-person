import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/db";
import { protectedProcedure } from "../../init";
import {
	chatQueryInput,
	chatHistoryListInput,
	chatGetInput,
	chatDeleteInput,
	chatClearHistoryInput,
	chatReindexInput,
	chatEmbeddingStatsInput,
	chatSearchInput,
} from "./validation";
import { generateResponse } from "@/lib/gemini";
import { normalizeTodayLocalToUTC, getMonthStartUTC } from "@/lib/date-utils";
import type {
	ChatQueryResponse,
	ChatSource,
	EmbeddingStats,
	ReindexResult,
} from "./types";
import { DocumentType, vectorSearch } from "@/lib/embedding-service/utils";
import { embeddingService } from "@/lib/embedding-service/index";

// Helper function to detect query intent
function detectQueryIntent(question: string): {
	types: DocumentType[];
	isStats: boolean;
} {
	const questionLower = question.toLowerCase();

	const isStats =
		questionLower.includes("berapa") ||
		questionLower.includes("total") ||
		questionLower.includes("jumlah") ||
		questionLower.includes("banyak") ||
		questionLower.includes("statistik") ||
		questionLower.includes("summary");

	const types: DocumentType[] = [];

	const attendanceKeywords = [
		'absen', 'kehadiran', 'check in', 'check out', 'hadir',
		'tidak hadir', 'terlambat', 'cuti', 'izin', 'sakit'
	];

	const shiftKeywords = [
		'shift', 'jadwal', 'jam kerja', 'masuk kerja', 'schedule',
		'pagi', 'siang', 'malam', 'jam masuk', 'jam keluar'
	];

	const employeeKeywords = [
		'karyawan', 'pegawai', 'staff', 'employee', 'nama',
		'gaji', 'salary', 'department', 'departemen', 'posisi',
		'position', 'jabatan', 'tunjangan'
	];

	if (attendanceKeywords.some(kw => questionLower.includes(kw))) {
		types.push(DocumentType.ATTENDANCE);
	}

	if (shiftKeywords.some(kw => questionLower.includes(kw))) {
		types.push(DocumentType.SHIFT);
	}

	if (employeeKeywords.some(kw => questionLower.includes(kw))) {
		types.push(DocumentType.EMPLOYEE);
	}

	if (types.length === 0) {
		types.push(DocumentType.EMPLOYEE, DocumentType.ATTENDANCE, DocumentType.SHIFT);
	}

	return { types, isStats };
}

export const chatRouter = {
	query: protectedProcedure
		.input(chatQueryInput)
		.mutation(async ({ input, ctx }): Promise<ChatQueryResponse> => {
			const { question, contextLimit = 5, conversationHistory = [] } = input;
			const { userId, organizationId } = ctx;

			const startTime = Date.now();

			try {
				// Build conversation context
				const conversationContext =
					conversationHistory.length > 0
						? conversationHistory
							.slice(-6)
							.map(
								(msg) =>
									`${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
							)
							.join("\n\n")
						: "";

				// Detect query intent
				const { types, isStats } = detectQueryIntent(question);
				console.log(`🔍 [Chat] Query intent: types=${types.join(',')}, isStats=${isStats}`);

				// Get aggregate statistics if needed
				let statsContext = "";
				if (isStats) {
					const statsData: any = {};

					// Employee stats
					if (types.includes(DocumentType.EMPLOYEE)) {
						const [totalEmployees, activeEmployees, employeesByDept] = await Promise.all([
							prisma.employee.count({ where: { organizationId } }),
							prisma.employee.count({ where: { organizationId, status: "ACTIVE" } }),
							prisma.employee.groupBy({
								by: ["departmentId"],
								where: { organizationId },
								_count: true,
							}),
						]);

						const deptIds = employeesByDept.map(e => e.departmentId).filter((id): id is string => id !== null);
						const departments = await prisma.department.findMany({
							where: { id: { in: deptIds } },
							select: { id: true, name: true },
						});
						const deptMap = new Map(departments.map(d => [d.id, d.name]));

						statsData.employees = {
							total: totalEmployees,
							active: activeEmployees,
							byDepartment: employeesByDept.map(e => ({
								dept: deptMap.get(e.departmentId || "") || "Tidak ada",
								count: e._count
							}))
						};
					}

					// Attendance stats
					if (types.includes(DocumentType.ATTENDANCE)) {
						const today = normalizeTodayLocalToUTC();
						const now = new Date();
						const startOfMonth = getMonthStartUTC(now.getFullYear(), now.getMonth() + 1);

						const [todayAttendances, monthAttendances, attendancesByStatus] = await Promise.all([
							prisma.attendance.count({
								where: {
									organizationId,
									date: today
								}
							}),
							prisma.attendance.count({
								where: {
									organizationId,
									date: { gte: startOfMonth }
								}
							}),
							prisma.attendance.groupBy({
								by: ["status"],
								where: {
									organizationId,
									date: { gte: startOfMonth }
								},
								_count: true,
							}),
						]);

						statsData.attendance = {
							today: todayAttendances,
							thisMonth: monthAttendances,
							byStatus: attendancesByStatus.map(a => ({
								status: a.status,
								count: a._count
							}))
						};
					}

					// Shift stats
					if (types.includes(DocumentType.SHIFT)) {
						const today = normalizeTodayLocalToUTC();
						const [totalShifts, todayAllocations] = await Promise.all([
							prisma.shift.count({ where: { organizationId } }),
							prisma.employeeShift.count({
								where: {
									employee: { organizationId },
									date: today
								}
							}),
						]);

						statsData.shifts = {
							totalShiftTypes: totalShifts,
							todayAllocations: todayAllocations
						};
					}

					// Format stats context
					const statsParts: string[] = ["STATISTIK:"];
					if (statsData.employees) {
						statsParts.push(`\nKARYAWAN:
- Total: ${statsData.employees.total}
- Aktif: ${statsData.employees.active}
- Per Department: ${statsData.employees.byDepartment.map((d: any) => `${d.dept} (${d.count})`).join(', ')}`);
					}
					if (statsData.attendance) {
						statsParts.push(`\nKEHADIRAN:
- Hari ini: ${statsData.attendance.today}
- Bulan ini: ${statsData.attendance.thisMonth}
- Per Status: ${statsData.attendance.byStatus.map((s: any) => `${s.status} (${s.count})`).join(', ')}`);
					}
					if (statsData.shifts) {
						statsParts.push(`\nSHIFT:
- Total Tipe Shift: ${statsData.shifts.totalShiftTypes}
- Alokasi Hari Ini: ${statsData.shifts.todayAllocations}`);
					}

					statsContext = statsParts.join('\n');
				}

				// SEMANTIC SEARCH across detected document types
				console.log(`🔍 [Chat] Searching across: ${types.join(', ')}`);

				const searchPromises = types.map(type => {
					switch (type) {
						case DocumentType.EMPLOYEE:
							return embeddingService.employee.searchEmployees(question, organizationId, contextLimit);
						case DocumentType.ATTENDANCE:
							return embeddingService.attendance.searchAttendances(question, organizationId, contextLimit);
						case DocumentType.SHIFT:
							return embeddingService.shiftAllocation.searchShiftAllocations(question, organizationId, contextLimit);
						default:
							return Promise.resolve([]);
					}
				});

				const searchResults = await Promise.all(searchPromises);
				const allDocs = searchResults.flat().sort((a, b) => b.similarity - a.similarity);
				const relevantDocs = allDocs.slice(0, contextLimit);

				const searchTime = Date.now() - startTime;
				console.log(`✅ [Chat] Found ${relevantDocs.length} relevant documents in ${searchTime}ms`);

				// BUILD RAG CONTEXT
				let context: string;
				let sources: ChatSource[] = [];

				const contextParts: string[] = [];

				if (statsContext) {
					contextParts.push(statsContext);
				}

				if (relevantDocs.length > 0) {
					const docContext = relevantDocs
						.map((doc, idx) => `[Dokumen ${idx + 1}]\nTipe: ${doc.metadata.type}\n${doc.content}`)
						.join("\n\n---\n\n");
					contextParts.push(docContext);

					// Format sources
					sources = relevantDocs.map((doc) => {
						const meta = doc.metadata as any;
						return {
							type: meta.type,
							employeeId: meta.employeeId,
							name: meta.employeeName || meta.name,
							department: meta.departmentName,
							position: meta.positionName,
							similarity: Math.round(doc.similarity * 100),
							preview: doc.content.substring(0, 150) + "...",
							additionalInfo: meta.type === DocumentType.ATTENDANCE
								? { date: meta.date, status: meta.status }
								: meta.type === DocumentType.SHIFT
									? { date: meta.date, shift: meta.shiftName }
									: undefined
						};
					});
				}

				context = contextParts.join("\n\n---\n\n");

				if (!context) {
					context = "Tidak ada data yang relevan ditemukan dalam database.";
				}

				// GENERATE AI RESPONSE
				console.log(`🤖 [Chat] Generating AI response...`);
				const answer = await generateResponse({
					question,
					context,
					conversationHistory: conversationContext,
				});
				const totalTime = Date.now() - startTime;
				console.log(`✅ [Chat] Response generated in ${totalTime}ms`);

				// SAVE CHAT HISTORY
				if (userId) {
					await prisma.chatHistory.create({
						data: {
							userId,
							organizationId,
							question,
							answer: answer || "",
							context: {
								sources: sources.map((s) => ({
									type: s.type,
									employeeId: s.employeeId,
									name: s.name,
									department: s.department,
									position: s.position,
									similarity: s.similarity,
									additionalInfo: s.additionalInfo,
								})),
								totalSources: relevantDocs.length,
								searchTime,
								totalTime,
								documentTypes: types,
							},
						},
					});
				}

				return {
					answer,
					sources,
					metadata: {
						totalSources: relevantDocs.length,
						searchTime,
						totalTime,
						documentTypes: types,
					},
				};
			} catch (error) {
				console.error("❌ [Chat] Error processing query:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Gagal memproses pertanyaan. Silakan coba lagi.",
				});
			}
		}),

	history: protectedProcedure
		.input(chatHistoryListInput)
		.query(async ({ input, ctx }) => {
			const { page, limit, search } = input;
			const skip = (page - 1) * limit;

			const where = {
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
				...(search && {
					OR: [
						{ question: { contains: search, mode: "insensitive" as const } },
						{ answer: { contains: search, mode: "insensitive" as const } },
					],
				}),
			};

			const [items, total] = await Promise.all([
				prisma.chatHistory.findMany({
					where,
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					skip,
					take: limit,
				}),
				prisma.chatHistory.count({ where }),
			]);

			return {
				items,
				total,
				page,
				perPage: limit,
				totalPages: Math.ceil(total / limit),
			};
		}),

	get: protectedProcedure.input(chatGetInput).query(async ({ input, ctx }) => {
		const chat = await prisma.chatHistory.findFirst({
			where: {
				id: input.id,
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!chat) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Chat history tidak ditemukan",
			});
		}

		return chat;
	}),

	delete: protectedProcedure
		.input(chatDeleteInput)
		.mutation(async ({ input, ctx }) => {
			const chat = await prisma.chatHistory.findFirst({
				where: {
					id: input.id,
					userId: ctx.userId || undefined,
					organizationId: ctx.organizationId,
				},
			});

			if (!chat) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Chat history tidak ditemukan",
				});
			}

			await prisma.chatHistory.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	clearHistory: protectedProcedure
		.input(chatClearHistoryInput)
		.mutation(async ({ ctx }) => {
			const deleted = await prisma.chatHistory.deleteMany({
				where: {
					userId: ctx.userId || undefined,
					organizationId: ctx.organizationId,
				},
			});

			return {
				success: true,
				deletedCount: deleted.count,
			};
		}),

	reindex: protectedProcedure
		.input(chatReindexInput)
		.mutation(async ({ input, ctx }): Promise<ReindexResult> => {
			if (!ctx.userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User tidak terautentikasi",
				});
			}

			const user = await prisma.user.findUnique({
				where: { id: ctx.userId },
				select: { role: true },
			});

			if (!user || !["ADMIN", "HR_MANAGER"].includes(user.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Hanya Admin atau HR Manager yang dapat melakukan re-indexing",
				});
			}

			try {
				const { documentType, documentIds, reindexAll, startDate, endDate } = input;

				if (reindexAll) {
					console.log(`🔄 [Chat] Starting full re-index for org: ${ctx.organizationId}`);

					const results = { success: 0, failed: 0, errors: [] as string[], total: 0 };

					// Re-index based on document type
					if (!documentType || documentType === 'employee') {
						const empResults = await embeddingService.employee.embedAllEmployees(ctx.organizationId);
						results.success += empResults.success;
						results.failed += empResults.failed;
						results.errors.push(...empResults.errors);
					}

					if (!documentType || documentType === 'attendance') {
						const now = new Date();
						const start = startDate ? new Date(startDate) : getMonthStartUTC(now.getFullYear(), 1);
						const end = endDate ? new Date(endDate) : new Date();
						const attResults = await embeddingService.attendance.embedAttendancesByDateRange(ctx.organizationId, start, end);
						results.success += attResults.success;
						results.failed += attResults.failed;
						results.errors.push(...attResults.errors);
					}

					if (!documentType || documentType === 'shift') {
						const now = new Date();
						const start = startDate ? new Date(startDate) : getMonthStartUTC(now.getFullYear(), 1);
						const end = endDate ? new Date(endDate) : new Date();
						const shiftResults = await embeddingService.shiftAllocation.embedShiftAllocationsByDateRange(ctx.organizationId, start, end);
						results.success += shiftResults.success;
						results.failed += shiftResults.failed;
						results.errors.push(...shiftResults.errors);
					}

					results.total = results.success + results.failed;

					return {
						message: "Re-indexing selesai",
						...results,
					};
				}

				if (documentIds && documentIds.length > 0) {
					console.log(`🔄 [Chat] Re-indexing ${documentIds.length} documents`);

					const embedFn = documentType === 'attendance'
						? embeddingService.attendance.embedAttendance
						: documentType === 'shift'
							? embeddingService.shiftAllocation.embedShiftAllocation
							: embeddingService.employee.embedEmployee;

					const results = await Promise.allSettled(
						documentIds.map((id) => embedFn(id))
					);

					const success = results.filter((r) => r.status === "fulfilled").length;
					const failed = results.filter((r) => r.status === "rejected").length;
					const errors = results
						.filter((r) => r.status === "rejected")
						.map((r) => (r as PromiseRejectedResult).reason?.message || "Unknown error");

					return {
						message: "Re-indexing dokumen terpilih selesai",
						success,
						failed,
						total: documentIds.length,
						errors: errors.length > 0 ? errors : undefined,
					};
				}

				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Pilih documentIds atau set reindexAll: true",
				});
			} catch (error) {
				console.error("❌ [Chat] Error during re-indexing:", error);

				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Gagal melakukan re-indexing",
				});
			}
		}),

	embeddingStats: protectedProcedure
		.input(chatEmbeddingStatsInput)
		.query(async ({ input, ctx }): Promise<EmbeddingStats> => {
			const { documentType = "employee" } = input;

			let totalDocuments = 0;

			if (documentType === 'employee') {
				totalDocuments = await prisma.employee.count({
					where: { organizationId: ctx.organizationId },
				});
			} else if (documentType === 'attendance') {
				totalDocuments = await prisma.attendance.count({
					where: { organizationId: ctx.organizationId },
				});
			} else if (documentType === 'shift') {
				totalDocuments = await prisma.employeeShift.count({
					where: { employee: { organizationId: ctx.organizationId } },
				});
			}

			const [totalEmbeddings, latestEmbedding] = await Promise.all([
				prisma.documentEmbedding.count({
					where: {
						organizationId: ctx.organizationId,
						metadata: {
							path: ["type"],
							equals: documentType,
						},
					},
				}),
				prisma.documentEmbedding.findFirst({
					where: {
						organizationId: ctx.organizationId,
						metadata: {
							path: ["type"],
							equals: documentType,
						},
					},
					orderBy: {
						updatedAt: "desc",
					},
					select: {
						updatedAt: true,
					},
				}),
			]);

			const coverage = totalDocuments > 0
				? Math.round((totalEmbeddings / totalDocuments) * 100)
				: 0;

			return {
				documentType,
				totalDocuments,
				totalEmbeddings,
				coverage,
				needsIndexing: totalDocuments - totalEmbeddings,
				lastUpdated: latestEmbedding?.updatedAt,
			};
		}),

	search: protectedProcedure
		.input(chatSearchInput)
		.query(async ({ input, ctx }) => {
			const { query, documentType, limit, minSimilarity = 0 } = input;

			try {
				const results = await vectorSearch(query, ctx.organizationId, {
					limit,
					documentType: documentType as DocumentType,
					minSimilarity,
				});

				return {
					results: results.map((doc) => ({
						id: doc.id,
						metadata: doc.metadata,
						similarity: Math.round(doc.similarity * 100),
						preview: doc.content.substring(0, 200) + "...",
					})),
					total: results.length,
				};
			} catch (error) {
				console.error("❌ [Chat] Error in search:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Gagal melakukan pencarian",
				});
			}
		}),

	stats: protectedProcedure.query(async ({ ctx }) => {
		const [totalChats, chatsToday, chatsThisWeek] = await Promise.all([
			prisma.chatHistory.count({
				where: {
					userId: ctx.userId || undefined,
					organizationId: ctx.organizationId,
				},
			}),
			prisma.chatHistory.count({
				where: {
					userId: ctx.userId || undefined,
					organizationId: ctx.organizationId,
					createdAt: {
						gte: normalizeTodayLocalToUTC(),
					},
				},
			}),
			prisma.chatHistory.count({
				where: {
					userId: ctx.userId || undefined,
					organizationId: ctx.organizationId,
					createdAt: {
						gte: new Date(new Date().setDate(new Date().getDate() - 7)),
					},
				},
			}),
		]);

		return {
			totalChats,
			chatsToday,
			chatsThisWeek,
		};
	}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";
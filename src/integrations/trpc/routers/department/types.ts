import { Prisma } from "@/generated/prisma/client";
import type { PaginatedResponse } from "@/lib/types";

export type DepartmentListItem = Prisma.DepartmentGetPayload<{
	include: { _count: { select: { employees: true } } };
}>;

export type DepartmentDetail = Prisma.DepartmentGetPayload<{
	include: {
		employees: true;
		positions: true;
	};
}>;

export type DepartmentListResponse = PaginatedResponse<DepartmentListItem>;


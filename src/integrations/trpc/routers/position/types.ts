import { Prisma } from "@/generated/prisma/client";
import type { PaginatedResponse } from "@/lib/types";

export type PositionListItem = Prisma.PositionGetPayload<{
	include: {
		department: true;
		_count: { select: { employees: true } };
	};
}>;

export type PositionDetail = Prisma.PositionGetPayload<{
	include: { department: true; employees: true };
}>;

export type PositionListResponse = PaginatedResponse<PositionListItem>;


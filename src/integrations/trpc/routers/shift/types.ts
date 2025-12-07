import { Prisma } from "@/generated/prisma/client";
import type { PaginatedResponse } from "@/lib/types";

export type ShiftListItem = Prisma.ShiftGetPayload<{
	include: {
		_count: { select: { employeeShifts: true } };
	};
}>;

export type ShiftDetail = Prisma.ShiftGetPayload<{}>;

export type ShiftListResponse = PaginatedResponse<ShiftListItem>;

export type EmployeeShiftItem = Prisma.EmployeeShiftGetPayload<{
	include: {
		employee: {
			select: { firstName: true; lastName: true; employeeId: true };
		};
		shift: true;
	};
}>;


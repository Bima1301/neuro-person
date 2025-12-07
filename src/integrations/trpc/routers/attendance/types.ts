import { Prisma } from "@/generated/prisma/client";
import type { PaginatedResponse } from "@/lib/types";

export type AttendanceListItem = Prisma.AttendanceGetPayload<{
	include: {
		employee: {
			select: {
				firstName: true;
				lastName: true;
				employeeId: true;
				email: true;
				phone: true;
				address: true;
				city: true;
				gender: true;
				hireDate: true;
				department: {
					select: { name: true };
				};
				position: {
					select: {
						name: true;
						locationPresenceType: true;
						shiftPresenceType: true;
					};
				};
				organization: {
					select: { name: true };
				};
			};
		};
	};
}> & {
	shift: {
		name: string;
		startTime: string;
		endTime: string;
	} | null;
	attendanceType: {
		name: string;
		code: string | null;
		isMustPresence: boolean;
	} | null;
};

export type AttendanceListResponse = PaginatedResponse<AttendanceListItem>;


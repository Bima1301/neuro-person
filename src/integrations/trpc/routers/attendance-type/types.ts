import { Prisma } from "@/generated/prisma/client";
import type { PaginatedResponse } from "@/lib/types";

export type AttendanceTypeListItem = Prisma.AttendanceTypeGetPayload<{}>;

export type AttendanceTypeDetail = Prisma.AttendanceTypeGetPayload<{}>;

export type AttendanceTypeListResponse = PaginatedResponse<AttendanceTypeListItem>;


import { createFileRoute } from "@tanstack/react-router";
import AttendanceContainer from "@/components/employee/attendance/containers";

export const Route = createFileRoute("/employee/attendance")({
	component: EmployeeAttendancePage,
});

function EmployeeAttendancePage() {
	return <AttendanceContainer />;
}


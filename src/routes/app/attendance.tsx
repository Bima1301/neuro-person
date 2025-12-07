import { createFileRoute } from "@tanstack/react-router";
import { AttendanceContainer } from "@/components/pages/attendance/containers";

export const Route = createFileRoute("/app/attendance")({
	component: AttendancePage,
});

function AttendancePage() {
	return <AttendanceContainer />;
}

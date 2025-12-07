import { createFileRoute } from "@tanstack/react-router";
import { AttendanceTypeContainer } from "@/components/pages/attendance-type/containers";

export const Route = createFileRoute("/app/attendance-types")({
	component: AttendanceTypesPage,
});

function AttendanceTypesPage() {
	return <AttendanceTypeContainer />;
}

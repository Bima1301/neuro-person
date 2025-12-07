import { createFileRoute } from "@tanstack/react-router";
import { DepartmentContainer } from "@/components/pages/department/containers";

export const Route = createFileRoute("/app/departments")({
	component: DepartmentsPage,
});

function DepartmentsPage() {
	return <DepartmentContainer />;
}

import { createFileRoute } from "@tanstack/react-router";
import { EmployeeContainer } from "@/components/pages/employee/containers";

export const Route = createFileRoute("/app/employees")({
	component: EmployeesPage,
});

function EmployeesPage() {
	return <EmployeeContainer />;
}

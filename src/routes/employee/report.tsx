import { createFileRoute } from "@tanstack/react-router";
import { EmployeeReportContainer } from "@/components/employee/report/container";

export const Route = createFileRoute("/employee/report")({
	component: EmployeeReportPage,
});

function EmployeeReportPage() {
	return <EmployeeReportContainer />;
}


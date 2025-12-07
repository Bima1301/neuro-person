import { createFileRoute } from "@tanstack/react-router";
import PermissionContainer from "@/components/employee/permission/containers";

export const Route = createFileRoute("/employee/permission")({
	component: EmployeePermissionPage,
});

function EmployeePermissionPage() {
	return <PermissionContainer />;
}


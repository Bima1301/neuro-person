import { createFileRoute } from "@tanstack/react-router";
import CicoContainer from "@/components/employee/cico/containers";

export const Route = createFileRoute("/employee/cico/$type")({
	component: EmployeeCicoPage,
});

function EmployeeCicoPage() {
	return <CicoContainer />;
}


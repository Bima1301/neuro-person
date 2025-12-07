import { createFileRoute } from "@tanstack/react-router";
import { PayrollContainer } from "@/components/pages/payroll/containers";

export const Route = createFileRoute("/app/payroll")({
	component: PayrollPage,
});

function PayrollPage() {
	return <PayrollContainer />;
}

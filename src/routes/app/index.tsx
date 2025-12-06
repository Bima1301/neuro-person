import { createFileRoute } from "@tanstack/react-router";
import { DashboardContainer } from "@/components/pages/dashboard/containers";

export const Route = createFileRoute("/app/")({
	component: DashboardPage,
});

function DashboardPage() {
	return <DashboardContainer />;
}

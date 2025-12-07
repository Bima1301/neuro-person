import { createFileRoute } from "@tanstack/react-router";
import { LeaveContainer } from "@/components/pages/leave/containers";

export const Route = createFileRoute("/app/leave")({
	component: LeavePage,
});

function LeavePage() {
	return <LeaveContainer />;
}

import { createFileRoute } from "@tanstack/react-router";
import { ShiftContainer } from "@/components/pages/shift/containers";

export const Route = createFileRoute("/app/shifts")({
	component: ShiftsPage,
});

function ShiftsPage() {
	return <ShiftContainer />;
}


import { createFileRoute } from "@tanstack/react-router";
import { ShiftAllocationContainer } from "@/components/pages/shift-allocation/containers";

export const Route = createFileRoute("/app/shift-allocation")({
	component: ShiftAllocationContainer,
});

import { createFileRoute } from "@tanstack/react-router";
import { PositionContainer } from "@/components/pages/position/containers";

export const Route = createFileRoute("/app/positions")({
	component: PositionsPage,
});

function PositionsPage() {
	return <PositionContainer />;
}

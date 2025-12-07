import { createFileRoute } from "@tanstack/react-router";
import { PermissionContainer } from "@/components/pages/permission/containers";

export const Route = createFileRoute("/app/permission")({
	component: PermissionPage,
});

function PermissionPage() {
	return <PermissionContainer />;
}


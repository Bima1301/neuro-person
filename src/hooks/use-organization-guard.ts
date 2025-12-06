import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/integrations/better-auth/client";
import { useTRPC } from "@/integrations/trpc/react";

export function useOrganizationGuard() {
	const { data: session, isPending: isSessionLoading } = useSession();
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { data, isLoading } = useQuery(
		trpc.organization.checkUserOrg.queryOptions(
			{ userId: session?.user?.id || "" },
			{ enabled: !!session?.user?.id },
		),
	);

	useEffect(() => {
		if (isSessionLoading || isLoading) return;

		// If user is logged in but has no organization, redirect to onboarding
		if (session?.user && data && !data.hasOrganization) {
			navigate({ to: "/onboarding" });
		}
	}, [session, data, isSessionLoading, isLoading, navigate]);

	return {
		isLoading: isSessionLoading || isLoading,
		hasOrganization: data?.hasOrganization || false,
	};
}

export function useOnboardingGuard() {
	const { data: session, isPending: isSessionLoading } = useSession();
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { data, isLoading } = useQuery(
		trpc.organization.checkUserOrg.queryOptions(
			{ userId: session?.user?.id || "" },
			{ enabled: !!session?.user?.id },
		),
	);

	useEffect(() => {
		if (isSessionLoading || isLoading) return;

		// If user already has organization, redirect to dashboard
		if (session?.user && data?.hasOrganization) {
			navigate({ to: "/app" });
		}
	}, [session, data, isSessionLoading, isLoading, navigate]);

	return {
		isLoading: isSessionLoading || isLoading,
		hasOrganization: data?.hasOrganization || false,
	};
}

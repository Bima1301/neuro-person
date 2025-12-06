import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import CircleLoader from "@/components/shared/circle-loader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMask } from "@/components/ui/input-mask";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient, useSession } from "@/integrations/better-auth/client";
import { useTRPC } from "@/integrations/trpc/react";

// Lazy load LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = lazy(() =>
	import("@/components/shared/location-picker").then((mod) => ({
		default: mod.LocationPicker,
	})),
);

export const Route = createFileRoute("/onboarding")({
	component: OnboardingWrapper,
});

function OnboardingWrapper() {
	const { data: session, isPending: isSessionLoading } = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isSessionLoading && !session?.user) {
			navigate({ to: "/" });
		}
	}, [session, isSessionLoading, navigate]);

	if (isSessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
				<CircleLoader />
			</div>
		);
	}

	if (!session?.user) {
		return null; // Will redirect
	}

	return <OnboardingPageWithGuard />;
}

const onboardingSchema = z.object({
	organizationName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
	organizationSlug: z
		.string()
		.min(2, "Slug minimal 2 karakter")
		.regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email("Email tidak valid").optional().or(z.literal("")),
	website: z.string().url("URL tidak valid").optional().or(z.literal("")),
	geoPolygon: z.array(z.tuple([z.number(), z.number()])).optional(),
	geoCenter: z
		.object({ lat: z.number(), lng: z.number() })
		.optional()
		.nullable(),
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

function OnboardingPageWithGuard() {
	const { data: session } = useSession();
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { data, isLoading } = useQuery(
		trpc.organization.checkUserOrg.queryOptions(
			{ userId: session?.user?.id || "" },
			{ enabled: !!session?.user?.id },
		),
	);

	useEffect(() => {
		if (isLoading) return;
		// If user already has organization, redirect to dashboard
		if (data?.hasOrganization) {
			navigate({ to: "/app" });
		}
	}, [data, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
				<CircleLoader />
			</div>
		);
	}

	if (data?.hasOrganization) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
				<CircleLoader />
			</div>
		);
	}

	return <OnboardingForm />;
}

function OnboardingForm() {
	const { data: session } = useSession();
	const navigate = useNavigate();
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState("form");
	const [locationData, setLocationData] = useState<{
		polygon: [number, number][];
		center: { lat: number; lng: number };
	} | null>(null);

	const form = useForm<OnboardingInput>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			organizationName: "",
			organizationSlug: "",
			address: "",
			phone: "",
			email: session?.user?.email || "",
			website: "",
			geoPolygon: undefined,
			geoCenter: undefined,
		},
	});

	const createOrgMutation = useMutation(
		trpc.organization.create.mutationOptions({
			onSuccess: () => {
				toast.success("Perusahaan berhasil dibuat!");
				navigate({ to: "/app" });
			},
			onError: (error) => {
				toast.error(`Gagal membuat perusahaan: ${error.message}`);
			},
		}),
	);

	const onSubmit = (data: OnboardingInput) => {
		if (!session?.user?.id) return;
		createOrgMutation.mutate({
			...data,
			geoPolygon: locationData?.polygon,
			geoCenter: locationData?.center,
			userId: session.user.id,
			userName: session.user.name || session.user.email || "",
			userEmail: session.user.email || "",
		});
	};

	// Auto-generate slug from organization name
	const handleNameChange = (value: string) => {
		const slug = value
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
		form.setValue("organizationSlug", slug);
	};

	// Validate form fields before moving to next tab
	const handleNextTab = async () => {
		const fieldsToValidate = [
			"organizationName",
			"organizationSlug",
			"email",
			"phone",
			"address",
			"website",
		] as const;

		const isValid = await form.trigger(fieldsToValidate);

		if (isValid) {
			setActiveTab("location");
		} else {
			toast.error("Mohon lengkapi form dengan benar");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
				<CardHeader className="text-center">
					<div className="flex justify-end mb-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={async () => {
								await authClient.signOut();
								navigate({ to: "/" });
							}}
						>
							Logout
						</Button>
					</div>
					<CardTitle className="text-2xl">Selamat Datang! 🎉</CardTitle>
					<CardDescription>
						Sebelum melanjutkan, silakan lengkapi informasi perusahaan Anda
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList className="grid w-full grid-cols-2 gap-5 bg-transparent">
									<TabsTrigger
										value="form"
										className="w-full h-1 rounded-full data-[state=active]:bg-primary bg-secondary"
									/>
									<TabsTrigger
										value="location"
										disabled={activeTab === "form"}
										className="w-full h-1 rounded-full data-[state=active]:bg-primary bg-secondary"
									/>
								</TabsList>

								<TabsContent value="form" className="space-y-4 mt-6">
									<FormField
										control={form.control}
										name="organizationName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nama Perusahaan *</FormLabel>
												<FormControl>
													<Input
														placeholder="PT. Contoh Indonesia"
														{...field}
														onChange={(e) => {
															field.onChange(e);
															handleNameChange(e.target.value);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="organizationSlug"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Slug URL *</FormLabel>
												<FormControl>
													<Input placeholder="pt-contoh-indonesia" {...field} />
												</FormControl>
												<p className="text-xs text-muted-foreground">
													Digunakan untuk identifikasi unik perusahaan
												</p>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email Perusahaan</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="info@perusahaan.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nomor Telepon</FormLabel>
												<FormControl>
													<InputMask
														inputType="phone"
														placeholder="+62"
														{...field}
														onChange={(_, rawValue) => {
															field.onChange(rawValue);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Alamat</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Jl. Contoh No. 123, Jakarta"
														rows={2}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Website</FormLabel>
												<FormControl>
													<Input
														placeholder="https://www.perusahaan.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button
										type="button"
										className="w-full"
										onClick={handleNextTab}
									>
										Selanjutnya
									</Button>
								</TabsContent>

								<TabsContent value="location" className="space-y-4 mt-6">
									<div className="space-y-2">
										<h3 className="text-lg font-semibold">
											Tentukan Area Perusahaan
										</h3>
										<p className="text-sm text-muted-foreground">
											Gambar area perusahaan untuk fitur geofencing absensi
											(opsional)
										</p>
									</div>

									<Suspense
										fallback={
											<div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
												<CircleLoader />
											</div>
										}
									>
										<LocationPicker
											value={
												locationData
													? {
															polygon: locationData.polygon,
															center: locationData.center,
														}
													: undefined
											}
											onChange={setLocationData}
										/>
									</Suspense>

									<div className="grid md:grid-cols-2 gap-2">
										<Button
											type="button"
											variant="outline"
											className="w-full"
											onClick={() => setActiveTab("form")}
										>
											Kembali
										</Button>
										<Button
											type="submit"
											className="w-full"
											disabled={createOrgMutation.isPending}
										>
											{createOrgMutation.isPending
												? "Membuat..."
												: "Buat Perusahaan"}
										</Button>
									</div>
								</TabsContent>
							</Tabs>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

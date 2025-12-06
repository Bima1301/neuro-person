import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import CircleLoader from "@/components/shared/circle-loader";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient, useSession } from "@/integrations/better-auth/client";
export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

type SignInSchema = z.infer<typeof signInSchema>;

function SignInPage() {
	const form = useForm<SignInSchema>({
		resolver: zodResolver(signInSchema),
	});

	const { data: session, isPending: isSessionLoading } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		if (!isSessionLoading && session?.user) {
			navigate({ to: "/app" });
		}
	}, [navigate, session?.user, isSessionLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsLoading(true);
			const signInResult = await authClient.signIn.email({
				email: form.watch("email"),
				password: form.watch("password"),
			});

			if (signInResult.error) {
				toast.error(
					signInResult.error.message || "Email atau password tidak valid",
				);
				return;
			}
		} catch (error: unknown) {
			toast.error("Terjadi kesalahan saat login");
			console.error("Error during sign-in:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isSessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<CircleLoader />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Login Form */}
			<div className="flex-1 flex items-center justify-center bg-white p-8">
				<div className="w-full max-w-md space-y-8">
					{/* Logo */}
					<Logo />

					{/* Welcome Text */}
					<div className="space-y-2">
						<h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
						<p className="text-gray-600">
							Enter to get unlimited access to data & information.
						</p>
					</div>

					{/* Login Form */}
					<Form {...form}>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter your email"
													autoComplete="email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-y-2">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Enter password"
													autoComplete="current-password"
													{...field}
													suffixIcon={
														<button
															type="button"
															onClick={() => setShowPassword(!showPassword)}
															className="text-gray-500 hover:text-gray-700 transition-colors"
														>
															{showPassword ? (
																<EyeOff className="h-5 w-5" />
															) : (
																<Eye className="h-5 w-5" />
															)}
														</button>
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base font-medium"
								disabled={
									!form.watch("email") || !form.watch("password") || isLoading
								}
							>
								{isLoading ? "Logging in..." : "Log In"}
							</Button>
						</form>
					</Form>

					{/* Register Link */}
					<div className="text-center text-sm text-gray-600">
						Don't have an account?{" "}
						<Link
							to="/sign-up"
							className="text-primary font-medium hover:underline"
						>
							Register here
						</Link>
					</div>

					{/* Employee Login Link */}
					<div className="pt-4 border-t text-center">
						<Link
							to="/employee-sign-in"
							className="text-sm text-primary hover:underline"
						>
							Masuk sebagai karyawan
						</Link>
					</div>
				</div>
			</div>

			{/* Right Side - Decorative Background */}
			<div className="hidden lg:flex flex-1 relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700">
				<DecorativeBackground />
			</div>
		</div>
	);
}

// Decorative Background Component
function DecorativeBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden">
			{/* Geometric Shapes */}
			<div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl" />
			<div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full opacity-15 blur-3xl" />

			{/* Pattern Overlay */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-lg rotate-45" />
				<div className="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full" />
				<div className="absolute bottom-32 left-32 w-20 h-20 border-4 border-white rotate-45" />
				<div className="absolute bottom-20 right-40 w-28 h-28 border-4 border-white rounded-lg" />
			</div>

			{/* Grid Pattern */}
			<div
				className="absolute inset-0 opacity-5"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
					backgroundSize: "50px 50px",
				}}
			/>

			{/* Content in Center */}
			<div className="absolute inset-0 flex items-center justify-center p-12">
				<div className="text-center text-white space-y-6 max-w-md">
					<div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm">
						<span className="text-4xl font-bold">ST</span>
					</div>
					<h2 className="text-4xl font-bold">Super Track</h2>
					<p className="text-white/80 text-lg">
						Manage your workforce efficiently with our comprehensive HR
						management system
					</p>
				</div>
			</div>
		</div>
	);
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Calendar, Clock, Fingerprint, Home, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/integrations/trpc/react";

const navItems = [
	{ icon: Home, label: "Home", href: "/employee" },
	{ icon: Clock, label: "Presensi", href: "/employee/attendance" },
	{ icon: Fingerprint, label: "Cico", href: "/employee/cico" },
	{ icon: Calendar, label: "Perizinan", href: "/employee/permission" },
	// { icon: BarChart3, label: "Report", href: "/employee/report" },
	{ icon: User, label: "Profile", href: "/employee/profile" },
];

export function EmployeeNavbar() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const router = useRouterState();
	const currentPath = router.location.pathname;

	// Get today's attendance
	const { data: todayAttendanceData } = useQuery(
		trpc.attendance.list.queryOptions({
			date: new Date().toISOString().split("T")[0],
		}),
	);

	const todayAttendance = todayAttendanceData?.items || [];

	const myAttendance = todayAttendance[0];

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-white/5 z-50">
			<div className="flex justify-around items-center max-w-md mx-auto">
				{navItems.map((item) => {
					const isActive =
						currentPath === item.href ||
						(item.href !== "/employee" && currentPath.startsWith(item.href));
					if (item.href === "/employee/cico") {
						return (
							<div className="relative"
								key={item.href}
							>
								<button
									type="button"
									onClick={() => {
										if (!myAttendance?.checkIn) {
											navigate({ to: "/employee/cico/$type", params: { type: "check-in" } });
										} else if (!myAttendance?.checkOut) {
											navigate({ to: "/employee/cico/$type", params: { type: "check-out" } });
										}
									}}
									disabled={!!myAttendance?.checkIn && !!myAttendance?.checkOut}
									className="size-20 rounded-full bg-button-employee flex items-center justify-center shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed -mt-14"
								>
									<Fingerprint className="size-12 text-white drop-shadow-lg" />
								</button>
							</div>
						);
					}
					return (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
								isActive
									? "text-cyan-400"
									: "text-white/50 hover:text-white/70",
							)}
						>
							<div className={cn(
								"p-2 rounded-lg transition-colors",
								isActive
									? "bg-cyan-500/20"
									: "hover:bg-white/5"
							)}>
								<item.icon className="h-5 w-5" />
							</div>
							<span className={cn(
								"text-xs font-medium",
								isActive && "text-cyan-400"
							)}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}


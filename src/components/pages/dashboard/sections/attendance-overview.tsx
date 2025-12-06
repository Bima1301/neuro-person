import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";

export function AttendanceOverview() {
	const trpc = useTRPC();
	const { data: attendance } = useQuery(
		trpc.dashboard.attendanceToday.queryOptions(),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Kehadiran Hari Ini</CardTitle>
				<CardDescription>
					{new Date().toLocaleDateString("id-ID", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
						<div className="text-2xl font-bold text-green-600">
							{attendance?.present || 0}
						</div>
						<div className="text-sm text-muted-foreground">Hadir</div>
					</div>
					<div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
						<div className="text-2xl font-bold text-yellow-600">
							{attendance?.late || 0}
						</div>
						<div className="text-sm text-muted-foreground">Terlambat</div>
					</div>
					<div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
						<div className="text-2xl font-bold text-red-600">
							{attendance?.absent || 0}
						</div>
						<div className="text-sm text-muted-foreground">Tidak Hadir</div>
					</div>
					<div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
						<div className="text-2xl font-bold text-blue-600">
							{attendance?.permission || 0}
						</div>
						<div className="text-sm text-muted-foreground">Perizinan</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


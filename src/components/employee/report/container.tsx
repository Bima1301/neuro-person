import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";

export function EmployeeReportContainer() {
	const trpc = useTRPC();
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	// Get attendance for selected month
	const startDate = `${selectedMonth}-01`;
	const endDate = new Date(
		Number(selectedMonth.split("-")[0]),
		Number(selectedMonth.split("-")[1]),
		0,
	)
		.toISOString()
		.split("T")[0];

	const { data: attendanceData } = useQuery(
		trpc.attendance.list.queryOptions({
			startDate,
			endDate,
		}),
	);
	const attendances = attendanceData?.items || [];

	// Calculate stats
	const stats = {
		workingDays: attendances.length,
		onTime: attendances.filter((a) => a.status === "PRESENT").length,
		late: attendances.filter((a) => a.status === "LATE").length,
		absent: attendances.filter((a) => a.status === "ABSENT").length,
	};

	// Generate days for chart (simplified)
	const daysInMonth = new Date(
		Number(selectedMonth.split("-")[0]),
		Number(selectedMonth.split("-")[1]),
		0,
	).getDate();

	const chartData = Array.from({ length: daysInMonth }, (_, i) => {
		const day = i + 1;
		const attendance = attendances.find((a) => {
			const d = new Date(a.date);
			return d.getDate() === day;
		});
		return {
			day,
			status: attendance?.status || null,
			hours: attendance?.checkIn && attendance?.checkOut ? 8 : 0,
		};
	});

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-blue-600 text-white px-4 pt-12 pb-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" className="text-white">
							<ArrowLeft className="h-6 w-6" />
						</Button>
						<h1 className="text-xl font-bold">Attendance Report</h1>
					</div>
					<Button variant="ghost" size="icon" className="text-white">
						<Calendar className="h-6 w-6" />
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="px-4 py-6 space-y-6">
				{/* Month Selector */}
				<div className="flex justify-center">
					<input
						type="month"
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
						className="px-4 py-2 border rounded-lg text-center"
					/>
				</div>

				{/* Pie Chart Placeholder */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-center">
							<div className="relative w-40 h-40">
								{/* Simple pie chart visualization */}
								<svg
									viewBox="0 0 100 100"
									className="w-full h-full"
									aria-label="Attendance overview chart"
								>
									<title>Attendance Overview Chart</title>
									<circle
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="#22c55e"
										strokeWidth="20"
										strokeDasharray={`${(stats.onTime / (stats.workingDays || 1)) * 251.2} 251.2`}
										transform="rotate(-90 50 50)"
									/>
									<circle
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="#f59e0b"
										strokeWidth="20"
										strokeDasharray={`${(stats.late / (stats.workingDays || 1)) * 251.2} 251.2`}
										strokeDashoffset={`${-(stats.onTime / (stats.workingDays || 1)) * 251.2}`}
										transform="rotate(-90 50 50)"
									/>
									<circle
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="#ef4444"
										strokeWidth="20"
										strokeDasharray={`${(stats.absent / (stats.workingDays || 1)) * 251.2} 251.2`}
										strokeDashoffset={`${-((stats.onTime + stats.late) / (stats.workingDays || 1)) * 251.2}`}
										transform="rotate(-90 50 50)"
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p className="text-xs text-gray-500">Overview</p>
									</div>
								</div>
							</div>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="text-center">
								<p className="text-2xl font-bold">{stats.workingDays}</p>
								<p className="text-xs text-gray-500">Working Days</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-green-600">
									{stats.onTime}
								</p>
								<p className="text-xs text-gray-500">On Time</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-orange-500">
									{stats.late}
								</p>
								<p className="text-xs text-gray-500">Late</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Daily Report */}
				<Card>
					<CardContent className="p-4">
						<h3 className="font-semibold mb-4">Daily Report</h3>
						<div className="flex gap-1 overflow-x-auto pb-2">
							{chartData.slice(0, 7).map((item) => (
								<div
									key={item.day}
									className="flex flex-col items-center gap-1"
								>
									<div
										className="w-8 bg-blue-500 rounded-t"
										style={{ height: `${item.hours * 8}px` }}
									/>
									<span className="text-xs text-gray-500">
										{["S", "M", "T", "W", "T", "F", "S"][item.day % 7]}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Attendance List */}
				<div className="space-y-2">
					<h3 className="font-semibold text-gray-700">Detail Kehadiran</h3>
					{attendances?.slice(0, 10).map((attendance) => (
						<Card key={attendance.id}>
							<CardContent className="p-4 flex items-center justify-between">
								<div className="flex items-center gap-3">
									{attendance.status === "PRESENT" ? (
										<CheckCircle className="h-5 w-5 text-green-500" />
									) : attendance.status === "LATE" ? (
										<Clock className="h-5 w-5 text-orange-500" />
									) : (
										<XCircle className="h-5 w-5 text-red-500" />
									)}
									<div>
										<p className="font-medium">
											{new Date(attendance.date).toLocaleDateString("id-ID", {
												weekday: "long",
												day: "numeric",
												month: "short",
											})}
										</p>
										<p className="text-sm text-gray-500">
											{attendance.checkIn
												? new Date(attendance.checkIn).toLocaleTimeString(
													"id-ID",
													{ hour: "2-digit", minute: "2-digit" },
												)
												: "--:--"}{" "}
											-{" "}
											{attendance.checkOut
												? new Date(attendance.checkOut).toLocaleTimeString(
													"id-ID",
													{ hour: "2-digit", minute: "2-digit" },
												)
												: "--:--"}
										</p>
									</div>
								</div>
								<span
									className={`text-sm font-medium ${attendance.status === "PRESENT"
											? "text-green-600"
											: attendance.status === "LATE"
												? "text-orange-600"
												: "text-red-600"
										}`}
								>
									{attendance.status === "PRESENT"
										? "Hadir"
										: attendance.status === "LATE"
											? "Terlambat"
											: "Tidak Hadir"}
								</span>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

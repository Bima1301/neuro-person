import { useQuery } from "@tanstack/react-query";
import { Fingerprint } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";

export default function CicoCard() {
	const trpc = useTRPC();

	const { data: todayShift } = useQuery(
		trpc.shiftAllocation.getToday.queryOptions({}),
	);

	// Get today's attendance
	const { data: todayAttendanceData } = useQuery(
		trpc.attendance.list.queryOptions({
			date: new Date().toISOString().split("T")[0],
		}),
	);

	const todayAttendance = todayAttendanceData?.items || [];

	const myAttendance = todayAttendance[0];

	return (
		<div className="px-4 -mt-20">
			<Card className="bg-stone-900 border-white/5 shadow-xl">
				<CardContent className="p-4">
					{todayShift && (
						<div className="">
							<div className="text-center">
								<p className="text-white/60 text-sm mb-3 font-medium">Shift Hari Ini</p>
								<div className="bg-[#252932] rounded-2xl p-4 border border-white/5">
									<p className="font-bold text-xl text-white mb-1">
										{todayShift.attendanceType.name}
									</p>
									{todayShift.shift && (
										<>
											<p className="text-sm text-cyan-400 mt-2 font-medium">
												{todayShift.shift.name}
											</p>
											<p className="text-xs text-white/50 mt-1">
												{todayShift.shift.startTime} - {todayShift.shift.endTime}
											</p>
										</>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Today's Status */}
					<div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-6">
						<div className="text-center bg-[#252932] rounded-xl p-4 border border-white/5">
							<p className="text-white/60 text-sm mb-2 font-medium">Clock In</p>
							<p className="font-bold text-2xl text-lime-400">
								{myAttendance?.checkIn
									? new Date(myAttendance.checkIn).toLocaleTimeString(
										"id-ID",
										{ hour: "2-digit", minute: "2-digit" },
									)
									: "--:--"}
							</p>
						</div>
						<div className="text-center bg-[#252932] rounded-xl p-4 border border-white/5">
							<p className="text-white/60 text-sm mb-2 font-medium">Clock Out</p>
							<p className="font-bold text-2xl text-cyan-400">
								{myAttendance?.checkOut
									? new Date(myAttendance.checkOut).toLocaleTimeString(
										"id-ID",
										{ hour: "2-digit", minute: "2-digit" },
									)
									: "--:--"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

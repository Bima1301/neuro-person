import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
	Camera,
	Clock,
	Mail,
	MapPin,
	Phone,
} from "lucide-react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { AttendanceListItem } from "@/integrations/trpc/routers/attendance/types";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type AttendanceDetail = AttendanceListItem;

interface AttendanceDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	attendance: AttendanceDetail | null;
}

const getStatusBadge = (status: string) => {
	const config: Record<
		string,
		{
			variant: "default" | "secondary" | "destructive" | "outline";
			label: string;
		}
	> = {
		PRESENT: { variant: "default", label: "Hadir" },
		LATE: { variant: "secondary", label: "Terlambat" },
		ABSENT: { variant: "destructive", label: "Tidak Hadir" },
		HALF_DAY: { variant: "outline", label: "Setengah Hari" },
	};
	return config[status] || { variant: "outline", label: status };
};

const formatTime = (time: Date | string | null) => {
	if (!time) return "-";
	const d = time instanceof Date ? time : new Date(time);
	return format(d, "HH:mm:ss", { locale: id });
};

const formatDate = (date: Date | string) => {
	const d = date instanceof Date ? date : new Date(date);
	return format(d, "d MMM, yyyy", { locale: id });
};

const formatDay = (date: Date | string) => {
	const d = date instanceof Date ? date : new Date(date);
	return format(d, "EEEE", { locale: id });
};

const getInitials = (firstName: string, lastName: string) => {
	return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
};

const getGenderLabel = (gender: string | null | undefined) => {
	if (!gender) return null;
	return gender === "MALE" ? "Laki-Laki" : "Perempuan";
};

const calculateLateTime = (
	checkIn: Date | string | null,
	shiftStartTime: string | null | undefined,
) => {
	if (!checkIn || !shiftStartTime) return null;

	const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
	const [hours, minutes] = shiftStartTime.split(":").map(Number);
	const shiftStart = new Date(checkInDate);
	shiftStart.setHours(hours, minutes, 0, 0);

	const diffMs = checkInDate.getTime() - shiftStart.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);

	if (diffMinutes <= 0) return null; // On time or early

	const hoursLate = Math.floor(diffMinutes / 60);
	const minutesLate = diffMinutes % 60;
	const secondsLate = diffSeconds % 60;

	if (hoursLate > 0) {
		return `${hoursLate} Jam ${minutesLate} Menit ${secondsLate} Detik`;
	}
	if (minutesLate > 0) {
		return `${minutesLate} Menit ${secondsLate} Detik`;
	}
	return `${secondsLate} Detik`;
};

export function AttendanceDetailDialog({
	open,
	onOpenChange,
	attendance,
}: AttendanceDetailDialogProps) {
	if (!attendance) return null;

	const statusBadge = getStatusBadge(attendance.status);
	const date = attendance.date instanceof Date
		? attendance.date
		: new Date(attendance.date);
	const checkInDate = attendance.checkIn
		? attendance.checkIn instanceof Date
			? attendance.checkIn
			: new Date(attendance.checkIn)
		: null;

	const lateTime = calculateLateTime(
		attendance.checkIn,
		attendance.shift?.startTime,
	);
	const initials = getInitials(
		attendance.employee.firstName,
		attendance.employee.lastName,
	);

	// Fix leaflet default marker icon
	useEffect(() => {
		delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
			iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
		});
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-7xl! max-h-[90vh] overflow-y-auto">
				<DialogHeader >
					<DialogTitle className="text-xl font-bold">
						Lihat Presensi
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
					{/* Left Column: Informasi Karyawan */}
					<div className="space-y-6">
						<div className="bg-white rounded-lg border p-6 space-y-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Informasi Karyawan
							</h3>

							{/* Profile Section */}
							<div className="flex items-start gap-4">
								<Avatar className="h-16 w-16">
									<AvatarFallback className="bg-primary text-white text-lg font-bold">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-2">
									{attendance.employee.gender && (
										<Badge variant="secondary" className="mb-2">
											{getGenderLabel(attendance.employee.gender)}
										</Badge>
									)}
									<h4 className="text-xl font-bold text-gray-900">
										{attendance.employee.firstName.toUpperCase()}{" "}
										{attendance.employee.lastName.toUpperCase()}
									</h4>
									<p className="text-sm text-gray-600">
										NIK: {attendance.employee.employeeId}
									</p>
								</div>
							</div>

							<Separator />

							{/* Kontak */}
							<div className="space-y-3">
								<h5 className="font-semibold text-gray-900">Kontak</h5>
								{attendance.employee.email && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<Mail className="h-4 w-4" />
										<span>{attendance.employee.email || '-'}</span>
									</div>
								)}
								{attendance.employee.phone && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<Phone className="h-4 w-4" />
										<span>{attendance.employee.phone || '-'}</span>
									</div>
								)}
							</div>

							<Separator />

							{/* Alamat */}
							<div className="space-y-3">
								<h5 className="font-semibold text-gray-900">Alamat</h5>
								{attendance.employee.address && (
									<div className="space-y-1 text-sm text-gray-600">
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											<span>Alamat: {attendance.employee.address || '-'}</span>
										</div>
										{attendance.employee.city && (
											<div className="pl-6">
												<p>Kota: {attendance.employee.city}</p>
											</div>
										)}
									</div>
								)}
							</div>

							<Separator />

							{/* Penempatan */}
							<div className="space-y-3">
								<h5 className="font-semibold text-gray-900">Penempatan</h5>
								{attendance.employee.position && (
									<div className="space-y-2">
										<Badge variant="destructive" className="mb-2">
											{attendance.employee.position.name}
										</Badge>
										{attendance.employee.hireDate && (
											<p className="text-sm text-gray-600">
												TMT:{" "}
												{format(
													attendance.employee.hireDate instanceof Date
														? attendance.employee.hireDate
														: new Date(attendance.employee.hireDate),
													"yyyy-MM-dd",
													{ locale: id },
												)}
											</p>
										)}
										{attendance.employee.organization && (
											<p className="text-sm text-gray-600">
												Company: {attendance.employee.organization.name}
											</p>
										)}
										{attendance.employee.department &&
											attendance.employee.position && (
												<p className="text-sm text-gray-600">
													{attendance.employee.department.name.toUpperCase()}-
													{attendance.employee.organization?.name || ""}
												</p>
											)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Informasi Presensi */}
					<div className="space-y-6">
						<div className="bg-white rounded-lg border p-6 space-y-6">
							<h3 className="text-lg font-semibold text-gray-900">
								Informasi Presensi
							</h3>

							{/* Overview */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Tanggal</p>
										<p className="font-semibold text-gray-900">
											{formatDate(date)}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-600">Hari</p>
										<p className="font-semibold text-gray-900">
											{formatDay(date)}
										</p>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-600 mb-2">Status</p>
									<Badge variant={statusBadge.variant}>
										{statusBadge.label}
									</Badge>
								</div>
							</div>

							<Separator />

							{/* Shift Information */}
							{attendance.shift && (
								<div className="space-y-3">
									<h5 className="font-semibold text-gray-900">Alokasi Shift</h5>
									<div className=" border rounded-md p-4 space-y-2">
										<div>
											<p className="text-sm mb-1">Nama Shift</p>
											<p className="font-bold text-lg">
												{attendance.shift.name}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm mb-1">Jam Mulai</p>
												<p className="font-medium">
													{attendance.shift.startTime}
												</p>
											</div>
											<div>
												<p className="text-sm mb-1">Jam Selesai</p>
												<p className="font-medium">
													{attendance.shift.endTime}
												</p>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											{attendance.attendanceType && (
												<div>
													<p className="text-sm mb-1">Tipe Kehadiran</p>
													<Badge >
														{attendance.attendanceType.name}
													</Badge>
												</div>
											)}
											{attendance.shift && (
												<div>
													<p className="text-gray-600">Jenis Jam Kerja</p>
													<Badge variant="outline" className="mt-1">
														{attendance.employee.position?.shiftPresenceType ===
															"FLEXIBLE"
															? "Dinamis (Sesuai Shift dan Target Kerja)"
															: "Tetap"}
													</Badge>
												</div>
											)}
											<div>
												<p className="text-gray-600">
													Jenis Lokasi Presensi
												</p>
												<Badge variant="outline" className="mt-1">
													{attendance.employee.position?.locationPresenceType ===
														"FLEXIBLE" || !attendance.employee.position?.locationPresenceType
														? "Dimana saja"
														: "Lokasi Tetap"}
												</Badge>
											</div>
										</div>
									</div>
								</div>
							)}

							<Separator />

							{/* Tabs for Check In and Check Out */}
							<Tabs defaultValue={attendance.checkIn ? "checkin" : "checkout"} className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="checkin" disabled={!attendance.checkIn}>
										<Clock className="mr-2 h-4 w-4" />
										Check In
									</TabsTrigger>
									<TabsTrigger value="checkout" disabled={!attendance.checkOut}>
										<Clock className="mr-2 h-4 w-4" />
										Check Out
									</TabsTrigger>
								</TabsList>

								{/* Check In Tab Content */}
								<TabsContent value="checkin" className="mt-4">
									{attendance.checkIn ? (
										<div className="space-y-4">
											<h5 className="font-semibold text-gray-900">
												Detail Check In
											</h5>
											<div className="space-y-3 text-sm">
												<div>
													<p className="text-gray-600">Tanggal</p>
													<p className="font-medium text-gray-900">
														{checkInDate &&
															format(checkInDate, "dd-MM-yyyy", {
																locale: id,
															})}
													</p>
												</div>
												<div>
													<p className="text-gray-600">Waktu Check In</p>
													<p className="font-medium text-gray-900">
														{formatTime(attendance.checkIn)} WIB
													</p>
												</div>
												<div>
													<p className="text-gray-600">Datang Lebih Awal</p>
													<p className="font-medium text-gray-900">-</p>
												</div>
												<div>
													<p className="text-gray-600">Datang Terlambat</p>
													<p className="font-medium text-gray-900">
														{lateTime || "-"}
													</p>
												</div>
												<div>
													<p className="text-gray-600">Jenis Check In</p>
													<Badge variant="secondary" className="mt-1">
														Mandiri
													</Badge>
												</div>
												<div>
													<p className="text-gray-600">Keterangan</p>
													<p className="font-medium text-gray-900">
														{attendance.checkInNotes || "-"}
													</p>
												</div>
											</div>

											{/* Tabs for Check In - Map and Photo */}
											{(attendance.checkInLat && attendance.checkInLng) || attendance.checkInPhoto ? (
												<Tabs defaultValue="map" className="mt-4">
													<TabsList className="grid w-full grid-cols-2">
														<TabsTrigger value="map" disabled={!attendance.checkInLat || !attendance.checkInLng}>
															<MapPin className="mr-2 h-4 w-4" />
															Lokasi
														</TabsTrigger>
														<TabsTrigger value="photo" disabled={!attendance.checkInPhoto}>
															<Camera className="mr-2 h-4 w-4" />
															Bukti Foto
														</TabsTrigger>
													</TabsList>
													<TabsContent value="map" className="mt-4">
														{attendance.checkInLat && attendance.checkInLng ? (
															<div className="h-64 rounded-lg border overflow-hidden">
																<MapContainer
																	center={[attendance.checkInLat, attendance.checkInLng]}
																	zoom={17}
																	className="h-full w-full"
																	scrollWheelZoom={false}
																>
																	<TileLayer
																		attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
																		url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
																	/>
																	<Marker position={[attendance.checkInLat, attendance.checkInLng]} />
																</MapContainer>
															</div>
														) : (
															<div className="h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
																<div className="text-center text-gray-500">
																	<MapPin className="h-12 w-12 mx-auto mb-2" />
																	<p className="text-sm">Lokasi Check In tidak tersedia</p>
																</div>
															</div>
														)}
													</TabsContent>
													<TabsContent value="photo" className="mt-4">
														{attendance.checkInPhoto ? (
															<div className="relative w-full aspect-video rounded-lg overflow-hidden border">
																<img
																	src={attendance.checkInPhoto}
																	alt="Check In Photo"
																	className="w-full h-full object-cover"
																/>
															</div>
														) : (
															<div className="h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
																<div className="text-center text-gray-500">
																	<Camera className="h-12 w-12 mx-auto mb-2" />
																	<p className="text-sm">Bukti foto Check In tidak tersedia</p>
																</div>
															</div>
														)}
													</TabsContent>
												</Tabs>
											) : null}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500">
											<p>Belum melakukan check-in</p>
										</div>
									)}
								</TabsContent>

								{/* Check Out Tab Content */}
								<TabsContent value="checkout" className="mt-4">
									{attendance.checkOut ? (
										<div className="space-y-4">
											<h5 className="font-semibold text-gray-900">
												Detail Check Out
											</h5>
											<div className="space-y-3 text-sm">
												<div>
													<p className="text-gray-600">Waktu Check Out</p>
													<p className="font-medium text-gray-900">
														{formatTime(attendance.checkOut)} WIB
													</p>
												</div>
												<div>
													<p className="text-gray-600">Keterangan</p>
													<p className="font-medium text-gray-900">
														{attendance.checkOutNotes || "-"}
													</p>
												</div>
											</div>

											{/* Tabs for Check Out - Map and Photo */}
											{(attendance.checkOutLat && attendance.checkOutLng) || attendance.checkOutPhoto ? (
												<Tabs defaultValue="map" className="mt-4">
													<TabsList className="grid w-full grid-cols-2">
														<TabsTrigger value="map" disabled={!attendance.checkOutLat || !attendance.checkOutLng}>
															<MapPin className="mr-2 h-4 w-4" />
															Lokasi
														</TabsTrigger>
														<TabsTrigger value="photo" disabled={!attendance.checkOutPhoto}>
															<Camera className="mr-2 h-4 w-4" />
															Bukti Foto
														</TabsTrigger>
													</TabsList>
													<TabsContent value="map" className="mt-4">
														{attendance.checkOutLat && attendance.checkOutLng ? (
															<div className="h-64 rounded-lg border overflow-hidden">
																<MapContainer
																	center={[attendance.checkOutLat, attendance.checkOutLng]}
																	zoom={17}
																	className="h-full w-full"
																	scrollWheelZoom={false}
																>
																	<TileLayer
																		attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
																		url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
																	/>
																	<Marker position={[attendance.checkOutLat, attendance.checkOutLng]} />
																</MapContainer>
															</div>
														) : (
															<div className="h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
																<div className="text-center text-gray-500">
																	<MapPin className="h-12 w-12 mx-auto mb-2" />
																	<p className="text-sm">Lokasi Check Out tidak tersedia</p>
																</div>
															</div>
														)}
													</TabsContent>
													<TabsContent value="photo" className="mt-4">
														{attendance.checkOutPhoto ? (
															<div className="relative w-full aspect-video rounded-lg overflow-hidden border">
																<img
																	src={attendance.checkOutPhoto}
																	alt="Check Out Photo"
																	className="w-full h-full object-cover"
																/>
															</div>
														) : (
															<div className="h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
																<div className="text-center text-gray-500">
																	<Camera className="h-12 w-12 mx-auto mb-2" />
																	<p className="text-sm">Bukti foto Check Out tidak tersedia</p>
																</div>
															</div>
														)}
													</TabsContent>
												</Tabs>
											) : null}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500">
											<p>Belum melakukan check-out</p>
										</div>
									)}
								</TabsContent>
							</Tabs>


						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}


import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Shift {
	id: string;
	name: string;
	startTime: string;
	endTime: string;
	_count?: {
		employeeShifts: number;
	};
}

export const createShiftColumns = (
	onEdit: (id: string) => void,
	onDelete: (id: string) => void,
): ColumnDef<Shift>[] => [
	{
		accessorKey: "name",
		header: "Nama Shift",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<span className="font-medium">{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: "startTime",
		header: "Jam Mulai",
		cell: ({ row }) => row.original.startTime,
	},
	{
		accessorKey: "endTime",
		header: "Jam Selesai",
		cell: ({ row }) => row.original.endTime,
	},
	{
		id: "duration",
		header: "Durasi",
		cell: ({ row }) => {
			const [startH, startM] = row.original.startTime.split(":").map(Number);
			const [endH, endM] = row.original.endTime.split(":").map(Number);
			let hours = endH - startH;
			let minutes = endM - startM;
			if (minutes < 0) {
				hours -= 1;
				minutes += 60;
			}
			if (hours < 0) hours += 24;
			return `${hours} jam ${minutes > 0 ? `${minutes} menit` : ""}`;
		},
	},
	{
		id: "employees",
		header: "Karyawan",
		cell: ({ row }) => row.original._count?.employeeShifts || 0,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Aksi</span>,
		cell: ({ row }) => (
			<div className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(row.original.id)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(row.original.id)}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Hapus
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
	},
];

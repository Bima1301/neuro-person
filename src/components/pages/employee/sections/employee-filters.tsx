import { Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface EmployeeFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: string | undefined;
	onStatusFilterChange: (value: "ACTIVE" | "INACTIVE" | undefined) => void;
}

export function EmployeeFilters({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
}: EmployeeFiltersProps) {
	return (
		<Card>
			<CardContent>
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari nama atau NIK karyawan..."
							className="pl-9"
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					</div>
					<Select
						value={statusFilter || "all"}
						onValueChange={(v) =>
							onStatusFilterChange(
								v === "all"
									? undefined
									: (v as "ACTIVE" | "INACTIVE" | undefined),
							)
						}
					>
						<SelectTrigger className="w-[180px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="ACTIVE">Active</SelectItem>
							<SelectItem value="INACTIVE">Inactive</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
}

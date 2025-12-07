import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { PermissionFilters } from "../sections/permission-filters";
import { PermissionTable } from "../sections/permission-table";

export function PermissionContainer() {
	const trpc = useTRPC();
	const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined>();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);

	const { data, isLoading } = useQuery(
		trpc.permission.list.queryOptions({
			status: statusFilter,
			search: search || undefined,
			page,
			perPage,
		}),
	);
	const permissions = data?.items || [];

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Manajemen Perizinan</h1>
					<p className="text-muted-foreground">
						Kelola pengajuan perizinan karyawan
					</p>
				</div>
			</div>

			{/* Filters */}
			<PermissionFilters
				search={search}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				statusFilter={statusFilter}
				onStatusFilterChange={(value) => {
					setStatusFilter(value);
					setPage(1);
				}}
			/>

			{/* Permission Table */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Pengajuan Perizinan</CardTitle>
					<CardDescription>
						Total {data?.total || 0} pengajuan perizinan
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PermissionTable
						permissions={permissions}
						isLoading={isLoading}
						page={page}
						totalPages={data?.totalPages}
						total={data?.total}
						pageSize={perPage}
						onPageChange={setPage}
						onPageSizeChange={(newPerPage) => {
							setPerPage(newPerPage);
							setPage(1);
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}


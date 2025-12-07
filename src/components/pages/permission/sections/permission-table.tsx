import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { useTRPC } from "@/integrations/trpc/react";
import { useSession } from "@/integrations/better-auth/client";
import { type PermissionRequest, createPermissionColumns } from "./permission-columns";

interface PermissionTableProps {
	permissions: PermissionRequest[];
	isLoading: boolean;
	page?: number;
	totalPages?: number;
	total?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
}

export function PermissionTable({
	permissions,
	isLoading,
	page,
	totalPages,
	total,
	pageSize,
	onPageChange,
	onPageSizeChange,
}: PermissionTableProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	const approveMutation = useMutation(
		trpc.permission.approve.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.permission.list.queryKey(),
				});
				toast.success("Perizinan berhasil disetujui");
			},
			onError: (error) => {
				toast.error(`Gagal menyetujui perizinan: ${error.message}`);
			},
		}),
	);

	const rejectMutation = useMutation(
		trpc.permission.reject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.permission.list.queryKey(),
				});
				toast.success("Perizinan berhasil ditolak");
			},
			onError: (error) => {
				toast.error(`Gagal menolak perizinan: ${error.message}`);
			},
		}),
	);

	const columns = useMemo(
		() =>
			createPermissionColumns(
				(id) => {
					if (!session?.user?.id) {
						toast.error("User ID tidak ditemukan");
						return;
					}
					approveMutation.mutate({ id, approvedById: session.user.id });
				},
				(id) => rejectMutation.mutate({ id, reason: "Ditolak oleh admin" }),
			),
		[approveMutation, rejectMutation, session?.user?.id],
	);

	if (isLoading) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Memuat data...
			</div>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={permissions}
			page={page}
			totalPages={totalPages}
			total={total}
			pageSize={pageSize}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
			manualPagination={true}
		/>
	);
}


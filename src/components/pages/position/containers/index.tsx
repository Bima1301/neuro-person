import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { PositionCreateDialog } from "../dialogs/create-dialog";
import { PositionEditDialog } from "../dialogs/edit-dialog";
import { PositionTable } from "../sections/position-table";

export function PositionContainer() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editPositionId, setEditPositionId] = useState<string | null>(null);
	const [deletePositionId, setDeletePositionId] = useState<string | null>(null);

	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);

	const { data, isLoading } = useQuery(
		trpc.position.list.queryOptions({
			page,
			perPage,
		}),
	);
	const positions = data?.items || [];

	const positionToDelete = positions.find((p) => p.id === deletePositionId);

	const deleteMutation = useMutation(
		trpc.position.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.position.list.queryKey(),
				});
				toast.success("Posisi berhasil dihapus");
				setDeletePositionId(null);
			},
			onError: (error) => {
				toast.error(`Gagal menghapus posisi: ${error.message}`);
			},
		}),
	);

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Posisi / Jabatan</h1>
					<p className="text-muted-foreground">
						Kelola posisi dan jabatan karyawan
					</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Tambah Posisi
				</Button>
			</div>

			{/* Positions Table */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Posisi</CardTitle>
					<CardDescription>
						Total {data?.total || 0} posisi terdaftar
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PositionTable
						positions={positions}
						isLoading={isLoading}
						onEdit={setEditPositionId}
						onDelete={setDeletePositionId}
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

			{/* Add Dialog */}
			<PositionCreateDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
			/>

			{/* Edit Dialog */}
			<PositionEditDialog
				open={!!editPositionId}
				onOpenChange={(open) => !open && setEditPositionId(null)}
				positionId={editPositionId}
			/>

			{/* Delete Dialog */}
			<DeleteDialog
				open={!!deletePositionId}
				onOpenChange={(open) => !open && setDeletePositionId(null)}
				onConfirm={() => {
					if (deletePositionId) {
						deleteMutation.mutate({ id: deletePositionId });
					}
				}}
				title="Hapus Posisi"
				itemName={
					positionToDelete ? `posisi "${positionToDelete.name}"` : undefined
				}
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import { AttendanceTypeForm } from "../sections/attendance-type-form";

interface AttendanceTypeEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	attendanceTypeId: string | null;
}

export function AttendanceTypeEditDialog({
	open,
	onOpenChange,
	attendanceTypeId,
}: AttendanceTypeEditDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: attendanceType, isLoading } = useQuery(
		trpc.attendanceType.get.queryOptions(
			{ id: attendanceTypeId! },
			{ enabled: !!attendanceTypeId && open },
		),
	);

	const updateMutation = useMutation(
		trpc.attendanceType.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.attendanceType.list.queryKey(),
				});
				toast.success("Tipe kehadiran berhasil diperbarui");
				onOpenChange(false);
			},
			onError: (error) => {
				toast.error(`Gagal memperbarui tipe kehadiran: ${error.message}`);
			},
		}),
	);

	const handleSubmit = (data: {
		name: string;
		code?: string;
		isMustPresence: boolean;
	}) => {
		if (!attendanceTypeId) return;
		updateMutation.mutate({ id: attendanceTypeId, ...data });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Tipe Kehadiran</DialogTitle>
					<DialogDescription>Perbarui data tipe kehadiran</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">
						Memuat data...
					</div>
				) : attendanceType ? (
					<AttendanceTypeForm
						onSubmit={handleSubmit}
						onCancel={() => onOpenChange(false)}
						isPending={updateMutation.isPending}
						defaultValues={{
							name: attendanceType.name,
							code: attendanceType.code || "",
							isMustPresence: attendanceType.isMustPresence,
						}}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

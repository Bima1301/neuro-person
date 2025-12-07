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
import { ShiftForm } from "../sections/shift-form";

interface ShiftEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shiftId: string | null;
}

export function ShiftEditDialog({
	open,
	onOpenChange,
	shiftId,
}: ShiftEditDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: shift, isLoading } = useQuery(
		trpc.shift.get.queryOptions(
			{ id: shiftId! },
			{ enabled: !!shiftId && open },
		),
	);

	const updateMutation = useMutation(
		trpc.shift.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.shift.get.queryKey() });
				queryClient.invalidateQueries({ queryKey: trpc.shift.list.queryKey() });
				toast.success("Shift berhasil diperbarui");
				onOpenChange(false);
			},
			onError: (error) => {
				toast.error(`Gagal memperbarui shift: ${error.message}`);
			},
		}),
	);

	const handleSubmit = (data: {
		name: string;
		startTime: string;
		endTime: string;
	}) => {
		if (!shiftId) return;
		updateMutation.mutate({ id: shiftId, ...data });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Shift</DialogTitle>
					<DialogDescription>Perbarui data shift</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">
						Memuat data...
					</div>
				) : shift ? (
					<ShiftForm
						onSubmit={handleSubmit}
						isLoading={updateMutation.isPending}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

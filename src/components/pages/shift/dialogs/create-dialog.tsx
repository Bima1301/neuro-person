import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import type { ShiftCreateInput } from "@/integrations/trpc/routers/shift/validation";
import { ShiftForm } from "../sections/shift-form";

interface ShiftCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ShiftCreateDialog({
	open,
	onOpenChange,
}: ShiftCreateDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createMutation = useMutation(
		trpc.shift.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.shift.list.queryKey() });
				toast.success("Shift berhasil ditambahkan");
				onOpenChange(false);
			},
			onError: (error) => {
				toast.error(`Gagal menambahkan shift: ${error.message}`);
			},
		}),
	);

	const handleSubmit = (data: ShiftCreateInput) => {
		createMutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Tambah Shift Baru</DialogTitle>
					<DialogDescription>
						Buat shift kerja baru untuk karyawan
					</DialogDescription>
				</DialogHeader>
				<ShiftForm
					onSubmit={handleSubmit}
					isLoading={createMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}

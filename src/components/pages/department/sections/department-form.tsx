import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	type DepartmentCreateInput,
	departmentCreateInput,
} from "@/integrations/trpc/routers/department/validation";

interface DepartmentFormProps {
	onSubmit: (data: DepartmentCreateInput) => void;
	onCancel: () => void;
	isPending?: boolean;
	defaultValues?: Partial<DepartmentCreateInput>;
}

export function DepartmentForm({
	onSubmit,
	onCancel,
	isPending,
	defaultValues,
}: DepartmentFormProps) {
	const form = useForm<DepartmentCreateInput>({
		resolver: zodResolver(departmentCreateInput),
		defaultValues: {
			name: "",
			description: "",
			...defaultValues,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nama Departemen *</FormLabel>
							<FormControl>
								<Input placeholder="Engineering" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Deskripsi</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Deskripsi departemen..."
									rows={3}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onCancel}>
						Batal
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Menyimpan..." : "Simpan"}
					</Button>
				</div>
			</form>
		</Form>
	);
}


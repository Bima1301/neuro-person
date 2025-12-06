import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useTRPC } from "@/integrations/trpc/react";
import { cn } from "@/lib/utils";

interface EmployeeComboboxProps {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	status?: "ACTIVE" | "INACTIVE";
}

const PAGE_SIZE = 10;

export function EmployeeCombobox({
	value,
	onValueChange,
	placeholder = "Pilih karyawan...",
	disabled,
	className,
	status = "ACTIVE",
}: EmployeeComboboxProps) {
	const trpc = useTRPC();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const listRef = useRef<HTMLDivElement>(null);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	// Infinite query for employees
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery(
			trpc.employee.infinite.infiniteQueryOptions(
				{
					search: debouncedSearch || undefined,
					status,
					limit: PAGE_SIZE,
				},
				{
					getNextPageParam: (lastPage) => lastPage.nextCursor,
				},
			),
		);

	// Flatten all pages into single array
	const employees = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) || [];
	}, [data]);

	// Get selected employee (separate query if not in list)
	const { data: selectedEmployeeData } = useQuery(
		trpc.employee.get.queryOptions(
			{ id: value! },
			{ enabled: !!value && !employees.find((e) => e.id === value) },
		),
	);

	// Find selected employee
	const selectedEmployee = useMemo(() => {
		const found = employees.find((emp) => emp.id === value);
		if (found) return found;
		if (selectedEmployeeData) return selectedEmployeeData;
		return null;
	}, [employees, value, selectedEmployeeData]);

	// Handle scroll for infinite loading
	const handleScroll = useCallback(() => {
		if (!listRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = listRef.current;
		if (
			scrollHeight - scrollTop <= clientHeight * 1.5 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					disabled={disabled}
				>
					{selectedEmployee
						? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Cari karyawan..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList
						ref={listRef}
						onScroll={handleScroll}
						className="max-h-[200px]"
					>
						{isLoading ? (
							<div className="flex items-center justify-center py-6">
								<Loader2 className="h-4 w-4 animate-spin" />
							</div>
						) : employees.length === 0 ? (
							<CommandEmpty>Tidak ada karyawan ditemukan.</CommandEmpty>
						) : (
							<CommandGroup>
								{employees.map((employee) => (
									<CommandItem
										key={employee.id}
										value={employee.id}
										onSelect={() => {
											onValueChange?.(employee.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === employee.id ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span>
												{employee.firstName} {employee.lastName}
											</span>
											<span className="text-xs text-muted-foreground">
												{employee.employeeId} •{" "}
												{employee.department?.name || "No Dept"}
											</span>
										</div>
									</CommandItem>
								))}
								{isFetchingNextPage && (
									<div className="flex items-center justify-center py-2">
										<Loader2 className="h-4 w-4 animate-spin" />
									</div>
								)}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

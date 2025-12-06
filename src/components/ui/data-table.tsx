"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageSize?: number;
	meta?: Record<string, unknown>;
	// Server-side pagination props
	page?: number;
	totalPages?: number;
	total?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	manualPagination?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageSize = 10,
	meta,
	page: controlledPage,
	totalPages,
	total,
	onPageChange,
	onPageSizeChange,
	manualPagination = false,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...(manualPagination
			? {
				manualPagination: true,
				pageCount: totalPages ?? -1,
			}
			: {
				getPaginationRowModel: getPaginationRowModel(),
			}),
		meta,
		initialState: {
			pagination: {
				pageSize,
				...(controlledPage !== undefined && { pageIndex: controlledPage - 1 }),
			},
		},
		...(controlledPage !== undefined && {
			state: {
				pagination: {
					pageIndex: controlledPage - 1,
					pageSize,
				},
			},
		}),
		onPaginationChange: (updater) => {
			if (manualPagination && onPageChange) {
				const newState =
					typeof updater === "function"
						? updater({
							pageIndex: controlledPage !== undefined ? controlledPage - 1 : 0,
							pageSize,
						})
						: updater;
				if (newState.pageIndex !== undefined) {
					onPageChange(newState.pageIndex + 1);
				}
				if (newState.pageSize !== undefined && onPageSizeChange) {
					onPageSizeChange(newState.pageSize);
				}
			}
		},
	});

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Tidak ada data.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between px-2">
				<div className="flex items-center space-x-2 text-sm text-muted-foreground">
					<span>Baris per halaman</span>
					<Select
						value={`${pageSize}`}
						onValueChange={(value) => {
							const newPageSize = Number(value);
							if (manualPagination && onPageSizeChange) {
								onPageSizeChange(newPageSize);
							} else {
								table.setPageSize(newPageSize);
							}
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[5, 10, 20, 30, 50].map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted-foreground">
						{manualPagination && total !== undefined ? (
							<>
								Menampilkan {((controlledPage ?? 1) - 1) * pageSize + 1}-
								{Math.min((controlledPage ?? 1) * pageSize, total)} dari {total}
							</>
						) : (
							<>
								Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
								{table.getPageCount()}
							</>
						)}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (manualPagination && onPageChange) {
								const currentPage = controlledPage ?? 1;
								if (currentPage > 1) {
									onPageChange(currentPage - 1);
								}
							} else {
								table.previousPage();
							}
						}}
						disabled={
							manualPagination
								? (controlledPage ?? 1) <= 1
								: !table.getCanPreviousPage()
						}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (manualPagination && onPageChange) {
								const currentPage = controlledPage ?? 1;
								const maxPage = totalPages ?? 1;
								if (currentPage < maxPage) {
									onPageChange(currentPage + 1);
								}
							} else {
								table.nextPage();
							}
						}}
						disabled={
							manualPagination
								? (controlledPage ?? 1) >= (totalPages ?? 1)
								: !table.getCanNextPage()
						}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}


import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useTRPC } from "@/integrations/trpc/react";

const chartConfig = {
	count: {
		label: "Jumlah",
	},
	ACTIVE: {
		label: "Active",
		color: "hsl(var(--chart-1))",
	},
	INACTIVE: {
		label: "Inactive",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

export function EmployeePieChart() {
	const trpc = useTRPC();

	const { data } = useQuery(trpc.employee.list.queryOptions({}));
	const employees = data?.items || [];

	// Count employees by status
	const statusCounts = employees.reduce(
		(acc, emp) => {
			acc[emp.status] = (acc[emp.status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const chartData = Object.entries(statusCounts).map(([status, count]) => ({
		status,
		count,
		fill: `var(--color-${status})`,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Status Karyawan</CardTitle>
				<CardDescription>Distribusi status karyawan saat ini</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length > 0 ? (
					<ChartContainer
						config={chartConfig}
						className="mx-auto aspect-square max-h-[300px]"
					>
						<PieChart>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Pie
								data={chartData}
								dataKey="count"
								nameKey="status"
								innerRadius={60}
								strokeWidth={5}
							/>
							<ChartLegend
								content={<ChartLegendContent nameKey="status" />}
								className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
							/>
						</PieChart>
					</ChartContainer>
				) : (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						Tidak ada data
					</div>
				)}
			</CardContent>
		</Card>
	);
}

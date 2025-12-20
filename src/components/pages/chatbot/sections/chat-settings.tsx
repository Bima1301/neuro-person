import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Database, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DocumentType } from '@/lib/embedding-service/types'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ChatSettings() {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	// Get embedding stats
	const { data: employeeStats, isLoading: loadingEmployeeStats } = useQuery(
		trpc.chatBot.embeddingStats.queryOptions({
			documentType: DocumentType.EMPLOYEE,
		}),
	)

	const { data: attendanceStats, isLoading: loadingAttendanceStats } = useQuery(
		trpc.chatBot.embeddingStats.queryOptions({
			documentType: DocumentType.ATTENDANCE,
		}),
	)

	const { data: shiftStats, isLoading: loadingShiftStats } = useQuery(
		trpc.chatBot.embeddingStats.queryOptions({
			documentType: DocumentType.SHIFT,
		}),
	)

	// Reindex mutation
	const reindexMutation = useMutation(
		trpc.chatBot.reindex.mutationOptions({
			onSuccess: (result) => {
				toast.success(
					`Re-indexing selesai! ${result.success} berhasil, ${result.failed} gagal`,
				)
				// Refresh stats
				queryClient.invalidateQueries({
					queryKey: trpc.chatBot.embeddingStats.queryKey(),
				})
			},
			onError: (error) => {
				toast.error(error.message || 'Gagal melakukan re-indexing')
			},
		}),
	)

	const stats = [
		{
			name: 'Karyawan',
			type: DocumentType.EMPLOYEE,
			data: employeeStats,
			loading: loadingEmployeeStats,
		},
		{
			name: 'Kehadiran',
			type: DocumentType.ATTENDANCE,
			data: attendanceStats,
			loading: loadingAttendanceStats,
		},
		{
			name: 'Shift & Cuti',
			type: DocumentType.SHIFT,
			data: shiftStats,
			loading: loadingShiftStats,
		},
	]

	const handleReindex = (docType?: DocumentType) => {
		if (docType) {
			reindexMutation.mutate({
				reindexAll: true,
				documentType: docType,
			})
		} else {
			reindexMutation.mutate({
				reindexAll: true,
			})
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">Pengaturan AI Chatbot</h2>
				<p className="text-muted-foreground">
					Kelola indexing data untuk pencarian semantic AI
				</p>
			</div>

			<Alert>
				<AlertDescription>
					Re-indexing diperlukan setelah menambah atau mengubah data karyawan,
					kehadiran, atau shift. Re-indexing memperbarui vector embeddings untuk
					pencarian semantic yang lebih akurat.
				</AlertDescription>
			</Alert>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{stats.map((stat) => (
					<Card key={stat.type}>
						<CardHeader>
							<CardTitle className="text-lg">{stat.name}</CardTitle>
							<CardDescription>Status indexing</CardDescription>
						</CardHeader>
						<CardContent>
							{stat.loading ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-5 w-5 animate-spin" />
								</div>
							) : stat.data ? (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Total Dokumen
										</span>
										<span className="font-semibold">
											{stat.data.totalDocuments}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Ter-index
										</span>
										<span className="font-semibold">
											{stat.data.totalEmbeddings}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Coverage
										</span>
										<span
											className={`font-semibold ${stat.data.coverage === 100
												? 'text-green-600'
												: stat.data.coverage >= 80
													? 'text-yellow-600'
													: 'text-red-600'
												}`}
										>
											{stat.data.coverage}%
										</span>
									</div>
									{stat.data.needsIndexing > 0 && (
										<div className="flex items-center gap-2 pt-2 text-sm text-orange-600">
											<XCircle className="h-4 w-4" />
											<span>{stat.data.needsIndexing} perlu di-index</span>
										</div>
									)}
									{stat.data.coverage === 100 && (
										<div className="flex items-center gap-2 pt-2 text-sm text-green-600">
											<CheckCircle2 className="h-4 w-4" />
											<span>Semua ter-index</span>
										</div>
									)}
									{stat.data.lastUpdated && (
										<div className="pt-2 text-xs text-muted-foreground">
											Terakhir update:{' '}
											{new Date(stat.data.lastUpdated).toLocaleString('id-ID')}
										</div>
									)}
								</div>
							) : (
								<div className="text-sm text-muted-foreground">
									Tidak ada data
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Re-index Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Re-index Data</CardTitle>
					<CardDescription>
						Perbarui vector embeddings untuk pencarian yang lebih akurat
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
						{stats.map((stat) => (
							<Button
								key={stat.type}
								variant="outline"
								onClick={() => handleReindex(stat.type)}
								disabled={reindexMutation.isPending}
								className="flex items-center justify-center gap-2"
							>
								{reindexMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
								Re-index {stat.name}
							</Button>
						))}
						<Button
							variant="default"
							onClick={() => handleReindex()}
							disabled={reindexMutation.isPending}
							className="flex items-center justify-center gap-2"
						>
							{reindexMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Database className="h-4 w-4" />
							)}
							Re-index Semua
						</Button>
					</div>

					{reindexMutation.isPending && (
						<Alert>
							<AlertDescription className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Sedang melakukan re-indexing, mohon tunggu...
							</AlertDescription>
						</Alert>
					)}

					{reindexMutation.isSuccess && (
						<Alert>
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>
								Re-indexing berhasil! {reindexMutation.data?.success} dokumen
								berhasil di-index, {reindexMutation.data?.failed} gagal.
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

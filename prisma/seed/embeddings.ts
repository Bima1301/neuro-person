export async function generateEmbeddings(organizationId: string) {
	console.log('')
	console.log('🤖 Generating embeddings for chatbot...')
	console.log('   (This may take a few minutes)')

	try {
		// Import embedding service - using file:// protocol for dynamic import
		// Note: tsx should handle this, but if it fails, embeddings can be generated later via API
		const embeddingModule = await import('../../src/lib/embedding-service/index.js')
		const { embeddingService } = embeddingModule

		// Embed all employees
		console.log('   Embedding employees...')
		const empResults = await embeddingService.employee.embedAllEmployees(
			organizationId,
			(current, total) => {
				if (current % 2 === 0 || current === total) {
					console.log(`     Progress: ${current}/${total} employees`)
				}
			},
		)
		console.log(`   ✅ Embedded ${empResults.success} employees (${empResults.failed} failed)`)

		// Embed all attendances
		console.log('   Embedding attendances...')
		const now = new Date()
		const startOfMonth = new Date(now.getFullYear(), 0, 1) // January 1st
		const endDate = new Date()
		const attResults =
			await embeddingService.attendance.embedAttendancesByDateRange(
				organizationId,
				startOfMonth,
				endDate,
			)
		console.log(
			`   ✅ Embedded ${attResults.success} attendances (${attResults.failed} failed)`,
		)

		// Embed all shift allocations
		console.log('   Embedding shift allocations...')
		const shiftResults =
			await embeddingService.shiftAllocation.embedShiftAllocationsByDateRange(
				organizationId,
				startOfMonth,
				endDate,
			)
		console.log(
			`   ✅ Embedded ${shiftResults.success} shift allocations (${shiftResults.failed} failed)`,
		)

		console.log('   ✅ All embeddings generated successfully!')
	} catch (error) {
		console.warn('   ⚠️  Warning: Failed to generate embeddings:', error)
		console.warn('   You can generate them later using the chatbot reindex endpoint.')
	}
}

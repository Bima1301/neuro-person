import { DEMO_ORGANIZATION } from './data.js'
import type { PrismaClient } from '../../src/generated/prisma/client.js'

export async function createOrganization(prisma: PrismaClient) {
	console.log('📦 Creating organization...')

	// Clean existing demo data if exists
	const existingOrg = await prisma.organization.findUnique({
		where: { slug: DEMO_ORGANIZATION.slug },
	})

	if (existingOrg) {
		console.log('⚠️  Demo organization already exists. Cleaning up...')
		await prisma.organization.delete({
			where: { id: existingOrg.id },
		})
		console.log('✅ Cleaned up existing demo data')
	}

	const organization = await prisma.organization.create({
		data: DEMO_ORGANIZATION,
	})

	console.log('✅ Organization created:', organization.name)
	return organization
}

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../src/generated/prisma/client.js'

// Create Prisma client with adapter for seed script
export function createPrismaClient(): PrismaClient {
	const connectionString = process.env.DATABASE_URL
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is required')
	}

	const adapter = new PrismaPg({
		connectionString,
	})

	return new PrismaClient({ adapter })
}

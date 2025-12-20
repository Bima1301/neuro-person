import { DEMO_USERS } from './data.js'
import type { PrismaClient } from '../../src/generated/prisma/client.js'

export async function createUsers(
	prisma: PrismaClient,
	organizationId: string,
) {
	console.log('👥 Creating users...')

	// Import auth instance
	const { auth } = await import('../../src/integrations/better-auth/auth.js')
	const password = '123123123'
	const createdUsers = []

	for (const userData of DEMO_USERS) {
		try {
			// Use Better Auth API to create user with proper password hashing
			const result = await auth.api.signUpEmail({
				body: {
					email: userData.email,
					password,
					name: userData.name,
				},
			})

			if (!result.user) {
				throw new Error('Gagal membuat akun di sistem autentikasi')
			}

			// Update user with organizationId and role
			const user = await prisma.user.update({
				where: { id: result.user.id },
				data: {
					organizationId,
					role: userData.role,
					emailVerified: true,
				},
			})

			createdUsers.push({ ...user, employeeId: userData.employeeId })
			console.log(`✅ User created: ${user.name} (${user.role})`)
		} catch (error) {
			console.error(`❌ Error creating user ${userData.email}:`, error)
			// If user already exists, try to find and update it
			const existingUser = await prisma.user.findUnique({
				where: { email: userData.email },
			})
			if (existingUser) {
				const updatedUser = await prisma.user.update({
					where: { id: existingUser.id },
					data: {
						organizationId,
						role: userData.role,
					},
				})
				createdUsers.push({ ...updatedUser, employeeId: userData.employeeId })
				console.log(`✅ User updated: ${updatedUser.name} (${updatedUser.role})`)
			} else {
				throw error
			}
		}
	}

	return createdUsers
}

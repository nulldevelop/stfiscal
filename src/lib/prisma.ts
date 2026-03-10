import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
	adapter?: PrismaPg
	prisma?: PrismaClient
}

function createAdapter() {
	return new PrismaPg({
		connectionString: process.env.DATABASE_URL,
		max: process.env.DATABASE_CONNECTION_LIMIT
			? Number.parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
			: 10,
	})
}

function createPrismaClient() {
	const adapter = globalForPrisma.adapter ?? createAdapter()
	if (!globalForPrisma.adapter) {
		globalForPrisma.adapter = adapter
	}
	return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma // ← sem verificação de NODE_ENV

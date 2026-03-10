
import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
	adapter: PrismaMariaDb | undefined
}

function createAdapter() {
	return new PrismaMariaDb({
		host: process.env.DATABASE_HOST,
		port: Number.parseInt(process.env.DATABASE_PORT || '3306', 10),
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
		connectionLimit: process.env.DATABASE_CONNECTION_LIMIT
			? Number.parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
			: 10,
		connectTimeout: process.env.DATABASE_CONNECT_TIMEOUT
			? Number.parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
			: 20000,
		acquireTimeout: process.env.DATABASE_CONNECT_TIMEOUT
			? Number.parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
			: 20000,
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

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

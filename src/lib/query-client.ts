import { QueryClient } from '@tanstack/react-query'

/**
 * QueryClient singleton para uso server-side (Node.js process memory).
 * Cache invalidado às 03:00 pelo cron antes de cada sync.
 *
 * ATENÇÃO: o cache vive na heap do processo Node.js.
 * Não é compartilhado entre instâncias/workers diferentes.
 * Não persiste após restart do servidor.
 */

const globalForQuery = global as unknown as { serverQueryClient: QueryClient }

export const serverQueryClient =
	globalForQuery.serverQueryClient ??
	new QueryClient({
		defaultOptions: {
			queries: {
				// 23h — garante que o cron das 03:00 sempre encontre dados stale
				staleTime: 23 * 60 * 60 * 1000,
				// Não faz retry em erros no servidor
				retry: false,
				// Nunca refetch automático (quem controla é o cron)
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
				refetchOnMount: false,
			},
		},
	})

if (process.env.NODE_ENV !== 'production') {
	globalForQuery.serverQueryClient = serverQueryClient
}

export function invalidateContratosCache() {
	serverQueryClient.removeQueries({ queryKey: ['contratos-vigentes'] })
	serverQueryClient.removeQueries({ queryKey: ['fiscais-contrato'] })
}

'use server'

import { getCurrentOrganizationId, getCurrentUserId } from '@/lib/auth-actions'
import { prisma } from '@/lib/prisma'
import { formatData } from '@/utils/formatData'

export async function getSetorialDataForContract(contratoId: string) {
	const userId = await getCurrentUserId()
	const organizationId = await getCurrentOrganizationId()

	if (!userId || !organizationId) return null

	const contrato = await prisma.contrato.findUnique({
		where: { id: contratoId },
		include: {
			licitacao: true,
			empresa: true,
			bensEServicosReports: {
				orderBy: { createdAt: 'asc' },
				include: { fiscalDoContrato: { select: { nome: true } } },
			},
			entregaNotificacoes: { orderBy: { createdAt: 'asc' } },
			entregaIncompletaNotificacoes: { orderBy: { createdAt: 'asc' } },
			notificacoesDesconformidade: { orderBy: { createdAt: 'asc' } },
		},
	})

	if (!contrato) return null

	const [transporteReports, obrasReports] = await Promise.all([
		prisma.transporteReport.findMany({
			where: { licitacaoId: contrato.licitacaoId, contratoNumero: contrato.numero.toString() },
			orderBy: { createdAt: 'asc' },
			include: { fiscalDoContrato: { select: { nome: true } } },
		}),
		prisma.obrasReport.findMany({
			where: { licitacaoId: contrato.licitacaoId, contratoNumero: contrato.numero.toString() },
			orderBy: { createdAt: 'asc' },
			include: { fiscalDoContrato: { select: { nome: true } } },
		}),
	])

	// Montar atos de fiscalização a partir dos relatórios dos setoriais
	const allReports = [
		...contrato.bensEServicosReports.map((r) => ({ 
			date: r.createdAt, 
			label: `Fiscalização ${r.secretariaNome}`, 
			dynamic: r.dynamicData ? JSON.parse(r.dynamicData) : {},
			isIrregular: r.cumprimentoObrigacoes === 'Não' || r.recebeuNotificacao === 'Sim'
		})),
		...transporteReports.map((r) => ({ 
			date: r.createdAt, 
			label: `Fiscalização ${r.secretariaNome}`, 
			dynamic: r.dynamicData ? JSON.parse(r.dynamicData) : {},
			isIrregular: r.cumprimentoObrigacoes === 'Não' || r.recebeuNotificacao === 'Sim'
		})),
		...obrasReports.map((r) => ({ 
			date: r.createdAt, 
			label: `Fiscalização ${r.secretariaNome}`, 
			dynamic: r.dynamicData ? JSON.parse(r.dynamicData) : {},
			isIrregular: r.comprimentoObrigacoesContrato === 'Não' || r.recebeuNotificacao === 'Sim'
		})),
	].sort((a, b) => a.date.getTime() - b.date.getTime())

	const atos = allReports.map((r, i) => {
		// Verifica se identificou irregularidade no campo 4.1 (Obrigações) ou se o status geral de obrigações é Não
		const identificou = r.isIrregular || r.dynamic['4.1'] ? 'Sim' : 'Não'
		return {
			num: i + 1,
			atoPraticado: r.label,
			data: formatData(r.date),
			identificouIrregularidade: identificou
		}
	})

	// Montar medidas a partir das notificações E dos campos 8.1/8.2/8.3 dos relatórios
	const medidasSetoriais = allReports
		.filter(r => r.dynamic['8.1'] || r.dynamic['8.2'])
		.map(r => ({
			irregularidade: r.dynamic['8.1'] || 'Irregularidade identificada no relatório setorial',
			medidasAdotadas: r.dynamic['8.2'] || 'Medidas registradas pelo fiscal setorial',
			data: formatData(r.date),
			problemaResolvido: r.dynamic['8.3'] || 'Não informado'
		}))

	const notificacoes = [
		...contrato.entregaNotificacoes.map((n) => ({
			irregularidade: `Atraso/Falta na entrega (${formatData(n.dataEnvio)})`,
			medidasAdotadas: n.desconformidade ?? 'Notificação enviada à contratada',
			data: formatData(n.createdAt),
			problemaResolvido: 'Pendente'
		})),
		...contrato.entregaIncompletaNotificacoes.map((n) => ({
			irregularidade: `Entrega incompleta (${formatData(n.dataEnvio)})`,
			medidasAdotadas: n.desconformidade ?? 'Notificação enviada à contratada',
			data: formatData(n.createdAt),
			problemaResolvido: 'Pendente'
		})),
		...contrato.notificacoesDesconformidade.map((n) => {
			let descricaoAmigavel = n.itemDesconformidade
			try {
				const itens = JSON.parse(n.itemDesconformidade)
				if (Array.isArray(itens)) {
					descricaoAmigavel = itens
						.map((i: any) => `${i.titulo || ''}: ${i.caracteristicasContrato || ''}`)
						.join('; ')
				}
			} catch (e) {
				// Se não for JSON, mantém o texto original
			}

			return {
				irregularidade: `Desconformidade: ${descricaoAmigavel.slice(0, 150)}`,
				medidasAdotadas: `Prazo de regularização: ${n.prazoRegularizacao} dias`,
				data: formatData(n.createdAt),
				problemaResolvido: 'Em regularização'
			}
		}),
	]

	const todasMedidas = [...medidasSetoriais, ...notificacoes]

	const medidas = todasMedidas.map((n, i) => ({
		num: i + 1,
		irregularidade: n.irregularidade,
		medidasAdotadas: n.medidasAdotadas,
		data: n.data,
		problemaResolvido: n.problemaResolvido
	}))

	return {
		contratoId: contrato.id,
		licitacaoModalidadeNumero: contrato.displayLicitacao,
		contratoNumero: contrato.displayContrato,
		contratada: contrato.contratado,
		objeto: contrato.objeto ?? '',
		atos,
		medidas,
	}
}

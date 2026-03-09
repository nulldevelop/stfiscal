import { prisma } from '@/lib/prisma'
import type { FiscalComStatus } from '../api/oxy-api'
import {
	getContratosVigentes,
	getFiscaisByContratosBatch,
} from '../api/oxy-api'
import {
	formatDataTermino,
	isContratoVigente,
	isFiscalVigente,
	normalizeName,
} from '../utils/helpers'

// --- Services ---

/**
 * Consulta a API e retorna apenas os fiscais vigentes de um contrato específico.
 */
export async function getFiscaisVigentesDoContrato(
	apiUrlFiscais: string,
	idOxy: string,
	contratoDataFim: Date | string,
): Promise<FiscalComStatus[]> {
	if (!isContratoVigente(contratoDataFim)) return []

	const map = await getFiscaisByContratosBatch(apiUrlFiscais, [idOxy])
	const fiscais = map.get(idOxy) || []

	return fiscais.filter((f) => isFiscalVigente(f.dataTermino))
}

/**
 * Vincula automaticamente um usuário (fiscal) aos contratos
 */
export async function linkFiscalToContracts(
	user: { id: string; name: string; email: string },
	organizationId: string,
): Promise<void> {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			autoLinkFiscais: true,
			apiUrlContratos: true,
			apiUrlFiscais: true,
		},
	})

	if (!org?.autoLinkFiscais || !org.apiUrlContratos || !org.apiUrlFiscais)
		return

	const userRecord = await prisma.user.findUnique({
		where: { id: user.id },
		select: { fiscalLinkedAt: true },
	})

	if (userRecord?.fiscalLinkedAt) return

	const member = await prisma.member.findFirst({
		where: { userId: user.id, organizationId },
		select: { fiscalCpf: true },
	})

	if (!member?.fiscalCpf) return

	const contratos = await getContratosVigentes(org.apiUrlContratos)

	if (!contratos.length) {
		await prisma.user.update({
			where: { id: user.id },
			data: { fiscalLinkedAt: new Date() },
		})
		return
	}

	const idsOxy = contratos.map((c) => c.idOxy)
	const fiscaisMap = await getFiscaisByContratosBatch(org.apiUrlFiscais, idsOxy)
	const normalizedUserName = normalizeName(user.name)

	const contratosDoUsuario = contratos.filter((contrato) => {
		if (!isContratoVigente(contrato.vigencia || contrato.terminoVigencia))
			return false

		const fiscais = fiscaisMap.get(contrato.idOxy) || []
		return fiscais.some((f) => normalizeName(f.ocupante) === normalizedUserName)
	})

	for (const contratoData of contratosDoUsuario) {
		const fiscais = fiscaisMap.get(contratoData.idOxy) || []
		const fiscalUsuario = fiscais.find(
			(f) =>
				normalizeName(f.ocupante) === normalizedUserName &&
				isFiscalVigente(f.dataTermino),
		)

		if (!fiscalUsuario) continue

		const contratoDB = await prisma.contrato.findFirst({
			where: {
				organizationId,
				idOxy: String(contratoData.idOxy),
			},
			select: { id: true },
		})

		if (!contratoDB) continue

		const fiscalRecord = await prisma.fiscalContrato.upsert({
			where: {
				cpf_organizationId: {
					cpf: member.fiscalCpf,
					organizationId,
				},
			},
			create: {
				organizationId,
				nome: normalizedUserName,
				matricula: '', // fallback
				cpf: member.fiscalCpf,
				cargo: fiscalUsuario.descricaoCargo || 'Fiscal',
				userId: user.id,
			},
			update: {
				userId: user.id,
				nome: normalizedUserName,
				updatedAt: new Date(),
			},
		})

		await prisma.fiscalContratoLink.upsert({
			where: {
				fiscalContratoId_contratoId: {
					fiscalContratoId: fiscalRecord.id,
					contratoId: contratoDB.id,
				},
			},
			create: {
				fiscalContratoId: fiscalRecord.id,
				contratoId: contratoDB.id,
				dtinicio: fiscalUsuario.dataInicio,
				dtfim: formatDataTermino(fiscalUsuario.dataTermino),
				ativo: true,
			},
			update: {
				ativo: true,
			},
		})
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { fiscalLinkedAt: new Date() },
	})
}

/**
 * Atualiza os vínculos de contratos de um fiscal (manual via UI)
 */
export async function updateFiscalContractLinks(
	organizationId: string,
	fiscalId: string, // userId
	links: Array<{
		contratoId: string
		isPrincipal: boolean
		isSetorial: boolean
	}>,
) {
	const fiscal = await prisma.user.findUnique({
		where: { id: fiscalId },
		include: {
			members: {
				where: { organizationId },
			},
		},
	})

	if (!fiscal || !fiscal.members[0]) {
		throw new Error('Fiscal ou vínculo de membro não encontrado.')
	}

	const member = fiscal.members[0]
	const normalizedName = normalizeName(fiscal.name || '')

	const fiscalRecord = await prisma.fiscalContrato.upsert({
		where: {
			cpf_organizationId: {
				cpf: member.fiscalCpf as string,
				organizationId,
			},
		},
		create: {
			userId: fiscalId,
			organizationId,
			nome: normalizedName,
			cpf: member.fiscalCpf || '',
			matricula: member.fiscalMatricula || '',
			cargo: member.fiscalCargo || 'Fiscal',
			ativo: true,
		},
		update: {
			userId: fiscalId,
			nome: normalizedName,
			updatedAt: new Date(),
		},
	})

	return prisma.$transaction(async (tx) => {
		await tx.fiscalContratoLink.deleteMany({
			where: { fiscalContratoId: fiscalRecord.id },
		})

		await tx.contratoFiscal.deleteMany({
			where: { memberId: member.id },
		})

		await tx.contratoSetorial.deleteMany({
			where: { memberId: member.id },
		})

		for (const link of links) {
			if (link.isPrincipal || link.isSetorial) {
				await tx.fiscalContratoLink.upsert({
					where: {
						fiscalContratoId_contratoId: {
							fiscalContratoId: fiscalRecord.id,
							contratoId: link.contratoId,
						},
					},
					create: {
						fiscalContratoId: fiscalRecord.id,
						contratoId: link.contratoId,
						dtinicio: new Date().toISOString(),
						ativo: true,
					},
					update: {
						ativo: true,
						updatedAt: new Date(),
					},
				})
			}

			if (link.isPrincipal) {
				await tx.contratoFiscal.deleteMany({
					where: { contratoId: link.contratoId },
				})
				await tx.contratoFiscal.create({
					data: { contratoId: link.contratoId, memberId: member.id },
				})
			}

			if (link.isSetorial) {
				await tx.contratoSetorial.create({
					data: { contratoId: link.contratoId, memberId: member.id },
				})
			}
		}
	})
}

/**
 * Vincula vários fiscais a um único contrato (manual via UI)
 */
export async function vincularFiscaisAoContrato(
	organizationId: string,
	contratoId: string,
	fiscais: Array<{ id: string }>, // userIds
) {
	return prisma.$transaction(async (tx) => {
		await tx.fiscalContratoLink.deleteMany({
			where: { contratoId },
		})

		for (const f of fiscais) {
			const user = await tx.user.findUnique({
				where: { id: f.id },
				select: { id: true, name: true },
			})
			if (!user) continue

			const member = await tx.member.findFirst({
				where: { userId: f.id, organizationId },
				select: {
					id: true,
					fiscalCpf: true,
					fiscalMatricula: true,
					fiscalCargo: true,
				},
			})

			const normalizedName = normalizeName(user.name)

			const fiscalRecord = await tx.fiscalContrato.upsert({
				where: {
					cpf_organizationId: {
						cpf: member?.fiscalCpf as string,
						organizationId,
					},
				},
				create: {
					userId: f.id,
					organizationId,
					nome: normalizedName,
					cpf: member?.fiscalCpf || '',
					matricula: member?.fiscalMatricula || '',
					cargo: member?.fiscalCargo || 'Fiscal',
					ativo: true,
				},
				update: {
					userId: f.id,
					nome: normalizedName,
					updatedAt: new Date(),
				},
			})

			await tx.fiscalContratoLink.upsert({
				where: {
					fiscalContratoId_contratoId: {
						fiscalContratoId: fiscalRecord.id,
						contratoId,
					},
				},
				create: {
					fiscalContratoId: fiscalRecord.id,
					contratoId,
					dtinicio: new Date().toISOString(),
					ativo: true,
				},
				update: {
					ativo: true,
					updatedAt: new Date(),
				},
			})
		}
	})
}

/**
 * Vincula TODOS os fiscais de um contrato (vindo da API)
 */
export async function linkAllFiscaisToContrato(
	contratoId: string,
	fiscais: FiscalComStatus[],
	organizationId: string,
	dataFimContrato?: Date,
): Promise<void> {
	if (!fiscais.length) return
	if (dataFimContrato && !isContratoVigente(dataFimContrato)) return

	for (const fiscal of fiscais) {
		if (!isFiscalVigente(fiscal.dataTermino)) continue

		const dtfim = formatDataTermino(fiscal.dataTermino)
		const normalizedNome = normalizeName(fiscal.ocupante)

		// Busca membro: por matrícula primeiro (mais confiável), depois por nome
		const memberMatch = await prisma.member.findFirst({
			where: {
				organizationId,
				OR: [
					...(fiscal.matricula ? [{ fiscalMatricula: fiscal.matricula }] : []),
					{
						user: {
							name: { contains: fiscal.ocupante },
						},
					},
				],
			},
			select: {
				id: true,
				userId: true,
				fiscalCpf: true,
				fiscalMatricula: true,
				fiscalCargo: true,
			},
		})

		// CPF real do membro (se encontrado) ou matrícula como identificador fallback
		// Sem nenhum identificador, não é possível criar o registro (cpf é required e único)
		const cpf = memberMatch?.fiscalCpf || fiscal.matricula
		if (!cpf) continue

		const fiscalRecord = await prisma.fiscalContrato.upsert({
			where: {
				cpf_organizationId: { cpf, organizationId },
			},
			create: {
				organizationId,
				nome: normalizedNome,
				cpf,
				matricula: memberMatch?.fiscalMatricula || fiscal.matricula || '',
				cargo: memberMatch?.fiscalCargo || fiscal.descricaoCargo || 'Fiscal',
				ativo: fiscal.ativo,
				userId: memberMatch?.userId ?? null,
			},
			update: {
				nome: normalizedNome,
				cargo: memberMatch?.fiscalCargo || fiscal.descricaoCargo || undefined,
				ativo: fiscal.ativo,
				userId: memberMatch?.userId ?? undefined,
				ultimaAtualizacao: new Date(),
			},
		})

		await prisma.fiscalContratoLink.upsert({
			where: {
				fiscalContratoId_contratoId: {
					fiscalContratoId: fiscalRecord.id,
					contratoId,
				},
			},
			create: {
				fiscalContratoId: fiscalRecord.id,
				contratoId,
				dtinicio: fiscal.dataInicio,
				dtfim,
				ativo: fiscal.ativo,
			},
			update: {
				dtfim: dtfim ?? undefined,
				ativo: fiscal.ativo,
				updatedAt: new Date(),
			},
		})

		// Vincula como fiscal principal ou setorial apenas se houver membro no sistema
		if (memberMatch?.id) {
			const cargo = (fiscal.descricaoCargo || '').toUpperCase().trim()
			const isPrincipal = cargo === 'FISCAL TECNICO'

			if (isPrincipal) {
				await prisma.contratoFiscal.upsert({
					where: { contratoId },
					create: { contratoId, memberId: memberMatch.id },
					update: { memberId: memberMatch.id },
				})
			} else {
				await prisma.contratoSetorial.upsert({
					where: {
						contratoId_memberId: { contratoId, memberId: memberMatch.id },
					},
					create: { contratoId, memberId: memberMatch.id },
					update: {},
				})
			}
		}
	}
}

export async function resetAllFiscalLinks(organizationId: string) {
	await prisma.contratoFiscal.deleteMany({
		where: { contrato: { organizationId } },
	})

	await prisma.contratoSetorial.deleteMany({
		where: { contrato: { organizationId } },
	})

	await prisma.fiscalContratoLink.deleteMany({
		where: { fiscalContrato: { organizationId } },
	})

	await prisma.fiscalContrato.updateMany({
		where: { organizationId },
		data: { userId: null },
	})

	await prisma.user.updateMany({
		where: {
			members: {
				some: { organizationId },
			},
		},
		data: { fiscalLinkedAt: null },
	})
}

export async function deleteFiscal(id: string, organizationId: string) {
	return prisma.fiscalContrato.delete({
		where: { id, organizationId },
	})
}

export async function deleteFiscalLink(linkId: string) {
	return prisma.fiscalContratoLink.delete({
		where: { id: linkId },
	})
}

export async function unlinkFiscalFromContrato(
	contratoId: string,
	userId: string,
) {
	const fiscalRecord = await prisma.fiscalContrato.findFirst({
		where: { userId },
		select: { id: true },
	})

	if (fiscalRecord) {
		await prisma.fiscalContratoLink.deleteMany({
			where: { fiscalContratoId: fiscalRecord.id, contratoId },
		})
	}
}

import { prisma } from '@/lib/prisma'

export async function createEmpresa(organizationId: string, data: { name: string; cnpj: string }) {
	return prisma.empresas.create({
		data: {
			...data,
			organizationId
		}
	})
}

export async function updateEmpresa(
	id: string,
	organizationId: string,
	data: {
		name: string
		cnpj: string
		endereco?: string
		representanteNome?: string
		representanteRg?: string
		representanteCpf?: string
	},
) {
	return prisma.empresas.update({
		where: { id, organizationId },
		data,
	})
}

export async function deleteEmpresa(id: string, organizationId: string) {
	const contratosVinculados = await prisma.contrato.count({
		where: {
			empresaId: id,
			organizationId,
		},
	})

	if (contratosVinculados > 0) {
		throw new Error(`Não é possível excluir esta empresa pois ela está vinculada a ${contratosVinculados} contrato(s).`)
	}

	return prisma.empresas.delete({ where: { id, organizationId } })
}

export async function createEmpresasBulk(organizationId: string, empresas: Array<{ name: string; cnpj: string }>) {
	if (empresas.length === 0) return 0
	
	const data = empresas.map(e => ({
		...e,
		organizationId
	}))

	const result = await prisma.empresas.createMany({
		data,
		skipDuplicates: true,
	})
	
	return result.count
}

export async function getEmpresasByCnpjs(organizationId: string, cnpjs: string[]) {
	return prisma.empresas.findMany({
		where: {
			organizationId,
			cnpj: { in: cnpjs }
		}
	})
}

import { prisma } from '@/lib/prisma'

const MODULES = [
	{ key: 'DadosFiscais', name: 'Dados Fiscais' },
	{ key: 'fiscal-relatorios', name: 'Relatórios de Fiscalização' },
	{ key: 'fiscal-notificacoes', name: 'Notificações de Fiscalização' },
	{ key: 'gestor-empresas', name: 'Gestão de Empresas' },
	{ key: 'gestor-licitacoes', name: 'Gestão de Licitações' },
	{ key: 'gestor-fiscais', name: 'Gestão de Fiscais' },
	{ key: 'gestor-contratos', name: 'Gestão de Contratos' },
	{ key: 'gestor-notificacoes', name: 'Gestão de Notificações' },
]

async function main() {
	const orgName = 'ST - Fiscalização e Relatórios'
	const slug = orgName
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.replace(/[^\w\s-]/g, '') // Remove caracteres especiais
		.replace(/\s+/g, '-') // Substitui espaços por hífens
		.replace(/-+/g, '-') // Remove hífens duplicados
		.trim()

	const orgAdmin = await prisma.organization.upsert({
		where: { slug: slug },
		update: {
			name: orgName,
			email: 'informatica@pmcgs.pr.gov.br',
			telefone: '(41) 3162-7000',
			cnpj: '76.105.600/0001-86',
		},
		create: {
			name: orgName,
			slug: slug,
			email: 'informatica@pmcgs.pr.gov.br',
			telefone: '(41) 3162-7000',
			cnpj: '76.105.600/0001-86',
			status: 'ACTIVE',
			createdAt: new Date(),
			logo: 'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2019/1/acirgtlkbv0.png',
		},
	})

	console.log('✅ Organização criada/atualizada:', orgAdmin.name)

	// Criar módulos para a organização
	for (const moduleInfo of MODULES) {
		await prisma.modulo.upsert({
			where: {
				organizationId_key: {
					organizationId: orgAdmin.id,
					key: moduleInfo.key,
				},
			},
			update: { name: moduleInfo.name },
			create: {
				organizationId: orgAdmin.id,
				key: moduleInfo.key,
				name: moduleInfo.name,
			},
		})
	}

	console.log('✅ Módulos registrados com sucesso!')
}

main()
	.then(async () => {
		console.log('✅ Seed concluído com sucesso!')
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error('❌ Erro ao executar seed:', e)
		await prisma.$disconnect()
		process.exit(1)
	})

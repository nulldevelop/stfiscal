import { prisma } from '@/lib/prisma'

async function seedFormConfig() {
	const organizations = await prisma.organization.findMany()

	const defaultFields = [
		// 2 – DETALHAMENTO DA EXECUÇÃO DO OBJETO
		{
			fieldKey: 'item',
			label: 'Item',
			type: 'TEXT',
			section: '2 – DETALHAMENTO DA EXECUÇÃO DO OBJETO',
			order: 10,
		},
		{
			fieldKey: 'descricao',
			label: 'Descrição',
			type: 'TEXTAREA',
			section: '2 – DETALHAMENTO DA EXECUÇÃO DO OBJETO',
			order: 11,
		},
		{
			fieldKey: 'informacoes',
			label: 'Informações',
			type: 'TEXTAREA',
			section: '2 – DETALHAMENTO DA EXECUÇÃO DO OBJETO',
			order: 12,
		},
		{
			fieldKey: 'reducaoGlosaObs',
			label: 'Redução / Glosa',
			type: 'TEXTAREA',
			section: '2 – DETALHAMENTO DA EXECUÇÃO DO OBJETO',
			order: 13,
		},

		// 3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA
		{
			fieldKey: 'manutencaoCondicoesHabilitacao',
			label:
				'3.1 – A contratada está mantendo as condições de habilitação e qualificação exigidas no Contrato/Edital/TR?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Não']),
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 20,
		},
		{
			fieldKey: 'certidaoDebitosFederais',
			label:
				'Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 21,
		},
		{
			fieldKey: 'certidaoDebitosEstadual',
			label: 'Certidão de Débitos Perante a Fazenda Estadual',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 22,
		},
		{
			fieldKey: 'certidaoDebitosMunicipal',
			label: 'Certidão de Débitos Perante a Fazenda Municipal',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 23,
		},
		{
			fieldKey: 'certidaoRegularidadeFGTS',
			label: 'Certidão de Regularidade do FGTS (CRF)',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 24,
		},
		{
			fieldKey: 'certidaoNegativaDebitosTrabalhistas',
			label: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Não']),
			section:
				'3 – MANUTENÇÃO DAS CONDIÇÕES DE HABILITAÇÃO, QUALIFICAÇÃO E REGULARIDADE FISCAL E TRABALHISTA',
			order: 25,
		},

		// 4 – OBRIGAÇÕES DA CONTRATADA
		{
			fieldKey: 'cumprimentoObrigacoes',
			label:
				'4.1 – A contratada está cumprindo todas as obrigações previstas no Contrato/Edital/TR para execução do objeto, incluindo-se a quantidade, qualidade, validade, valores e preços pactuados, prazo de entrega, especificações e modo de execução, dentre outros?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Parcialmente', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Parcialmente', 'Não']),
			section: '4 – OBRIGAÇÕES DA CONTRATADA',
			order: 30,
		},
		{
			fieldKey: 'atendeChamados',
			label:
				'4.2 – A contratada atende os chamados da contratante em tempo hábil para o desenvolvimento e efetividade das atividades administrativas?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Parcialmente', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Parcialmente', 'Não']),
			section: '4 – OBRIGAÇÕES DA CONTRATADA',
			order: 31,
		},
		{
			fieldKey: 'prepostoAcessivel',
			label:
				'4.3 – O preposto da empresa se mostra acessível para comunicar-se com o fiscal de contrato, resolver os problemas detectados e apresentar as soluções para o adequado cumprimento das obrigações contratuais?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Parcialmente', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Parcialmente', 'Não']),
			section: '4 – OBRIGAÇÕES DA CONTRATADA',
			order: 32,
		},

		// 5 – NOTIFICAÇÕES E SANÇÕES
		{
			fieldKey: 'recebeuNotificacao',
			label:
				'5.1 – A empresa recebeu alguma notificação referente ao presente contrato, em decorrência do descumprimento de alguma cláusula contratual?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Sim']),
			section: '5 – NOTIFICAÇÕES E SANÇÕES',
			order: 40,
		},
		{
			fieldKey: 'aberturaProcessoAdministrativo',
			label:
				'5.2 – Em caso de resposta afirmativa à pergunta 5.1, houve abertura de processo administrativo disciplinar em âmbito licitatório?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			hasObs: true,
			requiredObsValue: JSON.stringify(['Sim']),
			section: '5 – NOTIFICAÇÕES E SANÇÕES',
			order: 41,
		},
		{
			fieldKey: 'sofreuSancao',
			label:
				'5.3 – Em caso de resposta afirmativa à pergunta 5.2, a contratada sofreu alguma sanção em decorrência do referido processo?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			hasObs: true,
			requiredObsValue: JSON.stringify(['Sim']),
			section: '5 – NOTIFICAÇÕES E SANÇÕES',
			order: 42,
		},

		// 6 – SUBCONTRATAÇÃO
		{
			fieldKey: 'realizaSubcontratacaoIlegal',
			label:
				'6.1 – A contratada realiza cessão ou subcontratação fora das hipóteses admitidas em lei ou sem a autorização da Administração?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não']),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify(['Sim']),
			section: '6 – SUBCONTRATAÇÃO',
			order: 50,
		},
		{
			fieldKey: 'subcontratadaCumpreObrigacoes',
			label:
				'6.2 – Em caso de existir subcontratação autorizada pela Administração, a subcontratada cumpre todas as obrigações previstas no Contrato/Edital/TR para execução do objeto, incluindo-se a quantidade, qualidade, validade, valores e preços pactuados, prazo de entrega, especificações e modo de execução, dentre outros?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Parcialmente', 'Não', 'Não se aplica']),
			hasObs: true,
			requiredObsValue: JSON.stringify(['Parcialmente', 'Não']),
			section: '6 – SUBCONTRATAÇÃO',
			order: 51,
		},
		{
			fieldKey: 'contratadaEncaminhaDocumentacaoSubcontratada',
			label:
				'6.3 – Em caso de existir subcontratação autorizada pela Administração, a contratada encaminha juntamente com a nota fiscal, toda a documentação da subcontratada, nos moldes da apresentada pela contratada, inclusive cópia da nota fiscal da subcontratada?',
			type: 'RADIO',
			options: JSON.stringify(['Sim', 'Não', 'Não se aplica']),
			hasObs: true,
			requiredObsValue: JSON.stringify(['Não']),
			section: '6 – SUBCONTRATAÇÃO',
			order: 52,
		},

		// 7 – GARANTIA CONTRATUAL
		{
			fieldKey: 'garantiaContratual',
			label: 'A contratada apresentou garantia contratual?',
			type: 'RADIO',
			options: JSON.stringify([
				'Não Previsto',
				'Caução em Dinheiro',
				'Seguro garantia',
				'Fiança Bancária',
			]),
			isRequired: true,
			hasObs: true,
			requiredObsValue: JSON.stringify([
				'Caução em Dinheiro',
				'Seguro garantia',
				'Fiança Bancária',
			]),
			section: '7 – GARANTIA CONTRATUAL',
			order: 60,
		},

		// 8 – OCORRÊNCIAS
		{
			fieldKey: 'irregularidadesPendencias',
			label: '8.1 - Irregularidades ou pendências registradas:',
			type: 'TEXTAREA',
			section: '8 – OCORRÊNCIAS',
			order: 70,
		},
		{
			fieldKey: 'providenciasAdotadas',
			label:
				'8.2 – Providências adotadas para solução de cada problema detectado na execução do contrato (anexar cópia dos documentos expedidos à contratada e/ou recebidos da mesma):',
			type: 'TEXTAREA',
			section: '8 – OCORRÊNCIAS',
			order: 71,
		},
		{
			fieldKey: 'resultados',
			label:
				'8.3 – Resultados (informar se os problemas foram sanados ou não e quais as consequências e encaminhamentos):',
			type: 'TEXTAREA',
			section: '8 – OCORRÊNCIAS',
			order: 72,
		},
	]

	for (const org of organizations) {
		console.log(`Seeding FormConfig for organization: ${org.name}`)

		for (const field of defaultFields) {
			await prisma.formConfig.upsert({
				where: {
					reportType_fieldKey_organizationId: {
						reportType: 'BENS_SERVICOS',
						fieldKey: field.fieldKey,
						organizationId: org.id,
					},
				},
				update: {
					label: field.label,
					type: field.type,
					options: field.options ?? null,
					isRequired: field.isRequired ?? false,
					hasObs: field.hasObs ?? false,
					requiredObsValue: field.requiredObsValue ?? null,
					section: field.section,
					order: field.order,
				},
				create: {
					reportType: 'BENS_SERVICOS',
					fieldKey: field.fieldKey,
					organizationId: org.id,
					label: field.label,
					type: field.type,
					options: field.options ?? null,
					isRequired: field.isRequired ?? false,
					hasObs: field.hasObs ?? false,
					requiredObsValue: field.requiredObsValue ?? null,
					section: field.section,
					order: field.order,
					isVisiblePrincipal: true,
					isVisibleSetorial: true,
					isActive: true,
				},
			})
		}
	}

	console.log('✅ FormConfig seed completed!')
}

seedFormConfig()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

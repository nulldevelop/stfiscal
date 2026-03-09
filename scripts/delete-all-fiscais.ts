import { prisma } from "@/lib/prisma"


async function main() {
  console.log('🗑️  Iniciando a exclusão de todos os registros da tabela FiscalContrato (com bypass de FK)...')

  // Desabilita verificação de chaves estrangeiras
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;')

  const count = await prisma.fiscalContrato.deleteMany()

  // Reabilita verificação
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;')

  console.log(`✅ Sucesso! ${count.count} registros foram removidos da tabela FiscalContrato.`)
  console.log('⚠️  Atenção: Relatórios e notificações vinculados a esses fiscais agora podem estar órfãos.')
}
main()
  .catch((e) => {
    console.error('❌ Erro ao excluir registros:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Mascara um CPF para exibir apenas os últimos dígitos (padrao: ***.***.123-45).
 * 
 * @param cpf O CPF (com ou sem formatação)
 * @returns O CPF mascarado
 */
export function maskCpf(cpf: string): string {
	const cleaned = cpf.replace(/\D/g, '')
	if (cleaned.length !== 11) return cpf

	// Pega os últimos 5 dígitos (3 do bloco final + 2 do dígito verificador)
	const visiblePart = cleaned.substring(6)
	
	// Monta a máscara
	return `***.***.${visiblePart.substring(0, 3)}-${visiblePart.substring(3)}`
}

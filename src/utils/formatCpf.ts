/**
 * Formata uma string de números para o padrão de CPF (XXX.XXX.XXX-XX).
 *
 * @param value A string com os números do CPF a ser formatado.
 * @returns A string do CPF formatado.
 */
export function formatCpf(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleanedValue = value.replace(/\D/g, "");

  // Limita a string a no máximo 11 dígitos, que é o tamanho do CPF
  const limitedValue = cleanedValue.substring(0, 11);

  // Aplica a formatação XXX.XXX.XXX-XX
  return limitedValue
    .replace(/^(\d{3})(\d)/, "$1.$2") // Adiciona o primeiro ponto (ex: 123.45678910)
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3") // Adiciona o segundo ponto (ex: 123.456.78910)
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Adiciona o hífen (ex: 123.456.789-10)
}

/**
 * Extrai apenas os dígitos de uma string de CPF formatada.
 * Remove pontos e hífens.
 *
 * @param cpf A string de CPF formatada.
 * @returns Uma string contendo apenas os dígitos do CPF.
 */
export function extractCpf(cpf: string): string {
  return cpf.replace(/[\.-]/g, "");
}
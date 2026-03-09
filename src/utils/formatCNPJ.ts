/**
 * Formata uma string de números para o padrão de CNPJ (XX.XXX.XXX/XXXX-XX).
 *
 * @param value A string com os números do CNPJ a ser formatado.
 * @returns A string do CNPJ formatado.
 */
export function formatCnpj(value: string) {
  const cleanedValue = value.replace(/\D/g, "");

  if (cleanedValue.length > 14) {
    return value.slice(0, 18); 
  }

  return cleanedValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Extrai apenas os dígitos de uma string de CNPJ formatada.
 * Remove pontos, barras e hífens.
 *
 * @param cnpj A string de CNPJ formatada.
 * @returns Uma string contendo apenas os dígitos do CNPJ.
 */
export function extractCnpj(cnpj: string) {
  return cnpj.replace(/[./-]/g, "");
}
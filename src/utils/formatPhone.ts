
/**
 * Formata uma string de números para o padrão de telefone brasileiro (ex: (XX) XXXXX-XXXX).
 * A função lida tanto com números de celular (11 dígitos) quanto fixos (10 dígitos).
 *
 * @param value A string com o número de telefone a ser formatado.
 * @returns A string do telefone formatado.
 */
export function formatPhone(value: string) {
  const cleanedValue = value.replace(/\D/g, "");

  if (cleanedValue.length > 11) {
    return value.slice(0, 15);
  }

  const formattedValue = cleanedValue
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2");

  return formattedValue;
}

/**
 * Extrai apenas os dígitos de uma string de telefone formatada.
 * Remove parênteses, espaços e hífens.
 *
 * @param phone A string de telefone formatada.
 * @returns Uma string contendo apenas os dígitos do número de telefone.
 */
export function extractPhoneNumber(phone: string) {
  const phoneValue = phone.replace(/[()\s-]/g, "");
  return phoneValue;
}



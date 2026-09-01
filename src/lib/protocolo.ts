/**
 * Protocolo de atendimento Valent.
 * Formato: VLT-PRIMEIRONOME-123 (3 primeiros dígitos do CPF).
 * Sem CPF, usa os 3 primeiros dígitos do telefone informado.
 * Sem nenhum dos dois, gera um sufixo curto aleatório (nunca um UUID feio).
 */

function normalizarNome(nome: string): string {
  const primeiro = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z ]/g, "")
    .trim()
    .split(/\s+/)[0];
  if (!primeiro) return "CLIENTE";
  return primeiro.toUpperCase().slice(0, 12);
}

function tresDigitos(cpf?: string | null, telefone?: string | null): string {
  const cpfDigits = (cpf ?? "").replace(/\D/g, "");
  if (cpfDigits.length >= 3) return cpfDigits.slice(0, 3);
  const telDigits = (telefone ?? "").replace(/\D/g, "");
  if (telDigits.length >= 3) return telDigits.slice(-3);
  return String(Math.floor(100 + Math.random() * 900));
}

export function gerarProtocolo(input: {
  nome?: string | null;
  cpf?: string | null;
  telefone?: string | null;
}): string {
  return `VLT-${normalizarNome(input.nome ?? "")}-${tresDigitos(input.cpf, input.telefone)}`;
}

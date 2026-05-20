const CPF_DIGITS = 11

export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

export function maskCPF(value: string): string {
  const digits = unmask(value).slice(0, CPF_DIGITS)

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function isValidCPFLength(value: string): boolean {
  return unmask(value).length === CPF_DIGITS
}

export function normalizeName(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
}
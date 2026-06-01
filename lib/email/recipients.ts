export function parseEmailList(value: string | null | undefined): string[] {
  if (!value) return []

  return Array.from(new Set(
    value
      .split(/[;,]/)
      .map(email => email.trim())
      .filter(Boolean)
  ))
}

export function hasInvalidEmails(value: string | null | undefined): boolean {
  return parseEmailList(value).some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

// Product wording only; retain custom phrases and the backend listener configuration.
export function wakeWordDisplayPhrase(phrase: string | null | undefined): string {
  const value = phrase?.trim()

  return !value || /^hey hermes$/i.test(value) ? 'hey mira' : value
}

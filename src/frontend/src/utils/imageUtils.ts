export function generateImageKey(personId: string, cardType: string): string {
  return `${personId}-${cardType}-${Date.now()}`;
}

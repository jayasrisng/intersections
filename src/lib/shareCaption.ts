/** Builds the caption that goes out with a shared map — the same voice as
 * the rest of the app, not corporate LinkedIn-speak. */
export function generateShareCaption(names: string[]): string {
  const mix = names.join(" x ");
  return `i'm not one thing. here's my intersection: ${mix}. what's yours?`;
}

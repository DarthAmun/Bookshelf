export const SPINE_COLORS = [
  '#2f3f5c', '#6e3338', '#244a4a', '#7a3a3f', '#553a55',
  '#6e4329', '#2f5052', '#7a5f2c', '#34503f', '#3c4250', '#46324a', '#494f3a',
]

export function colorFromString(s: string): string {
  const hash = [...s].reduce((a, c) => a + c.charCodeAt(0), 0)
  return SPINE_COLORS[hash % SPINE_COLORS.length]!
}

export function spineInitialFor(title: string): string {
  return title.replace(/^(The|A|An)\s+/i, '').charAt(0).toUpperCase()
}

export function surnameOf(author: string): string {
  return author.split(' ').pop() ?? author
}

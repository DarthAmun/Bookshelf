export const SPINE_COLORS = [
  '#3c4250', '#2f3f5c', '#4b3030', '#2c4a3e', '#4a3b2a',
  '#3a3050', '#1e3d59', '#5c3d2e', '#2d4a22', '#4a2c40',
  '#1a3a4a', '#3d2a1a', '#2a3d2a', '#4a3a1a', '#1a2a4a',
] as const

export function colorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length]!
}

export function spineInitialFor(title: string): string {
  return title.replace(/^(The|A|An)\s+/i, '').charAt(0).toUpperCase() || 'T'
}

export function surnameOf(author: string): string {
  const parts = author.trim().split(/\s+/)
  return parts[parts.length - 1] ?? author
}

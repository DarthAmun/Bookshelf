/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    './src/renderer/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#100e0a',
          900: '#15120d',
          850: '#1b1711',
          800: '#221d16',
          750: '#2a241b',
        },
        bone: '#e9e4d8',
        muted: '#9a907f',
        faint: '#6c6253',
        brass: {
          DEFAULT: '#c4a468',
          soft: '#d8bd83',
          dim: '#7c6838',
        },
      },
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

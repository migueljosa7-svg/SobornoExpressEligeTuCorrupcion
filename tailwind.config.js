/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a', paper: '#f3ead3', corrupt: '#e11d2e', billete: '#f5c518',
        inst: '#5b6470', panel: '#16161a'
      },
      fontFamily: { display: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'], mono: ['ui-monospace', 'Consolas', 'monospace'] },
      boxShadow: { brut: '5px 5px 0 0 #000', brutY: '5px 5px 0 0 #f5c518' }
    }
  },
  plugins: []
};

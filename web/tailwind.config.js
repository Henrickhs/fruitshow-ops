export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        acai: {
          50: '#fbf7fc',
          100: '#f3e8f5',
          500: '#7c2d82',
          700: '#521754',
          900: '#2d0c32'
        },
        folha: '#26734d',
        pitaya: '#d6336c',
        sol: '#f6b73c',
        tinta: '#1e293b'
      },
      boxShadow: {
        panel: '0 18px 50px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

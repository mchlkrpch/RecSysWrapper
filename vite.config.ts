import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  resolve:{
    alias:{
      // 'redux':'redux/dist/redux.js'
    }
  },
  optimizeDeps: {
    include: [
      'redux',
      'react',
      'react-dom',
      '@ark-ui/react',
      '@zag-js/pagination',
      '@zag-js/password-input',
      '@zag-js/popover'
    ],
    exclude: ['@zag-js'],
  },
  // server:{
  //   host:'0.0.0.0',
  //   port:80,
  //   allowedHosts:[
  //     '1spaced.ru',
  //     'localhost',
  //     '127.0.0.1',
  //   ]
  // },
})
// import howtouse from './media/howtouse.md?raw';
// export const HOW_TO_USE = howtouse;

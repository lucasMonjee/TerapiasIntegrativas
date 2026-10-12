import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // O build vai direto para o wwwroot do Web.UI, que entrega o site.
    // emptyOutDir: false para não apagar os outros arquivos do wwwroot (imagens, favicon...);
    // a pasta wwwroot/assets antiga é limpa pelo script "prebuild" do package.json.
    build: {
      outDir: '../TerapiasIntegrativas/TerapiasIntegrativas.Web.UI/wwwroot',
      emptyOutDir: false,
    },
    server: {
      port: 5173,
      // Em desenvolvimento, chamadas para /api são repassadas para a API .NET,
      // evitando a necessidade de configurar CORS localmente.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://localhost:7212',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

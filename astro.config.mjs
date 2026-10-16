// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  // Set BASE when hosting under a subdirectory, e.g. BASE=/layout/ npm run build
  base: process.env.BASE ?? '/',
  trailingSlash: 'always',
  integrations: [icon()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});

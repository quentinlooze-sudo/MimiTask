import { defineConfig } from 'vite';

export default defineConfig({
  // Racine = dossier courant (index.html à la racine)
  root: '.',
  // Assets publics (icônes PWA, manifest, sw.js) copiés tels quels au build
  publicDir: false,
  build: {
    outDir: 'dist',
    // Copier les assets statiques dans le build
    assetsInlineLimit: 0
  },
  server: {
    port: 3000,
    open: true
  }
});

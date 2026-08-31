import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const suppressMotionWarn = () => ({
  name: 'suppress-motion-warn',
  transformIndexHtml(html: string) {
    return html.replace(
      '</head>',
      `<script>try{const o=console.warn;console.warn=(...a)=>{const m=typeof a[0]==='string'?a[0]:'';if(m.includes('motion() is deprecated')||m.includes('is not an animatable'))return;o.apply(console,a)};const oe=console.error;console.error=(...a)=>{const m=typeof a[0]==='string'?a[0]:'';if(m.includes('motion() is deprecated'))return;oe.apply(console,a)}}catch{}</script></head>`,
    );
  },
});

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // Must be first to patch console before framer-motion evaluates
    suppressMotionWarn(),
    devtools({ removeDevtoolsOnBuild: true }),
    nitro({
      preset: process.env.VERCEL ? 'vercel' : undefined,
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config

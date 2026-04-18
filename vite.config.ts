import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import babel from 'vite-plugin-babel'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), reactCompiler()],
  resolve: {
    tsconfigPaths: true,
  },
})

function reactCompiler(): Plugin {
  const reactCompilerConfig = {
    // @see https://react.dev/reference/react-compiler/configuration
  }
  return babel({
    filter: /\.[jt]sx?$/,
    babelConfig: {
      presets: ['@babel/preset-typescript'], // if you use TypeScript
      plugins: [['babel-plugin-react-compiler', reactCompilerConfig]],
    },
  })
}

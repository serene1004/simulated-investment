import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'simulated-investment'
const githubPagesBase = `/${repositoryName}/`

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? githubPagesBase : '/',
  plugins: [vue()],
})

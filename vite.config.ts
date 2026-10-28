import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

export default defineConfig(() => {
  const configuredBase = process.env.VITE_BASE_PATH
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isGitHubPagesProject = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  const isGitHubPagesUserSite = repositoryName?.endsWith('.github.io')

  return {
    base: configuredBase ?? (isGitHubPagesProject && !isGitHubPagesUserSite ? `/${repositoryName}/` : '/'),
    plugins: [react()],
  }
})

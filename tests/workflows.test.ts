import { describe, expect, it } from 'vitest'

// The GitHub Pages deployment and the SETU web-server package each build the Classic tool from a
// fixed commit. They must use the same one, so both destinations serve the same Classic tool.
const workflows = import.meta.glob('../.github/workflows/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const classicRef = (file: string) => workflows[file]?.match(/CLASSIC_REF:\s*([0-9a-f]{40})/)?.[1]

describe('deployment workflows', () => {
  it('build the Classic tool from the same commit', () => {
    const pages = classicRef('../.github/workflows/deploy.yml')
    const webserver = classicRef('../.github/workflows/webserver-package.yml')
    expect(pages).toMatch(/^[0-9a-f]{40}$/)
    expect(webserver).toBe(pages)
  })

  it('keep the web-server package away from GitHub Pages', () => {
    const w = workflows['../.github/workflows/webserver-package.yml']
    expect(w).toContain('SITE_BASE: /review/')
    expect(w).not.toMatch(/pages:\s*write|deploy-pages|upload-pages-artifact/)
  })
})

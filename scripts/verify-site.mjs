#!/usr/bin/env node
/**
 * Checks an assembled static site (the current tool at the root, the Classic tool in classic/)
 * before it is published or packaged.
 *
 *   node scripts/verify-site.mjs <site-dir> <base>     e.g.  node scripts/verify-site.mjs site /review/
 *
 * Fails (exit 1) if either index.html is missing, if any asset URL in them does not start with the
 * expected base or does not exist, if development files have been included, or if a JavaScript
 * file still refers to a different base path.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const [siteDir, base] = process.argv.slice(2)
if (!siteDir || !base || !base.startsWith('/') || !base.endsWith('/')) {
  console.error('Usage: node scripts/verify-site.mjs <site-dir> <base>   (base like /review/)')
  process.exit(2)
}

const problems = []
const KNOWN_BASES = ['/setu-module-review/', '/review/']
const FORBIDDEN = new Set(['node_modules', 'src', '.git', 'package.json', 'package-lock.json'])

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? [path, ...walk(path)] : [path]
  })
}

/** Check one app: its index.html and the files it references. */
function checkApp(appDir, appBase, label) {
  const index = join(appDir, 'index.html')
  if (!existsSync(index)) {
    problems.push(`${label}: ${relative(siteDir, index)} is missing`)
    return
  }
  const html = readFileSync(index, 'utf8')
  const urls = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1])
  if (!urls.some((u) => u.endsWith('.js'))) problems.push(`${label}: index.html loads no script`)
  if (!urls.some((u) => u.endsWith('.css')))
    problems.push(`${label}: index.html loads no stylesheet`)
  for (const url of urls) {
    if (/^(https?:)?\/\//.test(url) || url.startsWith('#') || url.startsWith('data:')) continue
    if (!url.startsWith(appBase)) {
      problems.push(`${label}: "${url}" does not start with ${appBase}`)
      continue
    }
    const file = join(appDir, url.slice(appBase.length).split(/[?#]/)[0])
    if (!existsSync(file)) problems.push(`${label}: "${url}" points at a missing file`)
  }
}

if (!existsSync(siteDir)) {
  console.error(`Site directory not found: ${siteDir}`)
  process.exit(1)
}

checkApp(siteDir, base, 'Current tool')
checkApp(join(siteDir, 'classic'), `${base}classic/`, 'Classic tool')

const files = walk(siteDir)
for (const path of files) {
  const rel = relative(siteDir, path)
  const top = rel.split(/[\\/]/)[0]
  const name = rel.split(/[\\/]/).at(-1)
  if (FORBIDDEN.has(top) || (rel.startsWith('classic') && FORBIDDEN.has(rel.split(/[\\/]/)[1])))
    problems.push(`Development files included: ${rel}`)
  if (name.endsWith('.map')) problems.push(`Source map included: ${rel}`)
}

// Vite writes the base into the JavaScript too (import.meta.env.BASE_URL), so a bundle built for
// another destination would link to the wrong place.
for (const other of KNOWN_BASES.filter((b) => b !== base)) {
  for (const path of files.filter((p) => p.endsWith('.js') || p.endsWith('.html'))) {
    if (readFileSync(path, 'utf8').includes(other))
      problems.push(`${relative(siteDir, path)} still refers to ${other}`)
  }
}

if (problems.length) {
  console.error(`Site check FAILED for ${siteDir} (base ${base}):`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`Site check passed for ${siteDir} (base ${base}): ${files.length} entries.`)

/** MCP resource and server-manager ownership across the resolved shipped profile templates. */

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { composeEntries, loadOverlayPatches, loadProfile } from '@deepseek-ai/dsh-app-boot'
import { PROFILE_TEMPLATES } from '@deepseek-ai/dsh-official-bundles'

const installAnchor = fileURLToPath(new URL('../package.json', import.meta.url))
const resourcePackage = '@deepseek-ai/dsh-mcp-resources'

describe('shipped MCP resource composition', () => {
  it.each(Object.keys(PROFILE_TEMPLATES))('%s carries one shared resource consumer without a server', (name) => {
    const home = mkdtempSync(join(tmpdir(), 'dsh-profile-mcp-'))
    try {
      const profile = loadProfile('dsh', name, installAnchor, home)
      const warnings: string[] = []
      const rows = composeEntries([
        ...profile.layers.map(layer => layer.patches),
        profile.patches,
      ], message => warnings.push(message))

      expect(rows.filter(row => row.name === resourcePackage)).toEqual([
        { id: 'mcp-resources', name: resourcePackage },
      ])
      expect(rows.filter(row => row.name === '@deepseek-ai/dsh-mcp-client')).toEqual([])
      expect(warnings).toEqual([])

      const owners = profile.layers.filter((layer) => {
        const manifest = JSON.parse(readFileSync(join(layer.packageDir, 'package.json'), 'utf8')) as {
          dependencies?: Record<string, string>
        }
        return manifest.dependencies?.[resourcePackage] !== undefined
      })
      expect(owners.map(owner => owner.packageName)).toEqual([
        name === 'sdk-minimal' ? '@deepseek-ai/dsh-sdk-minimal' : '@deepseek-ai/dsh-base',
      ])
    } finally {
      rmSync(home, { recursive: true, force: true })
    }
  })

  it.each(Object.keys(PROFILE_TEMPLATES))('%s mounts the server manager only with the Web application', (name) => {
    const home = mkdtempSync(join(tmpdir(), 'dsh-profile-mcp-'))
    try {
      const profile = loadProfile('dsh', name, installAnchor, home)
      const rows = composeEntries([...profile.layers.map(layer => layer.patches), profile.patches])
      expect(rows.filter(row => row.name === '@deepseek-ai/dsh-mcp-manager')).toEqual(name === 'web'
        ? [{ id: 'mcp-manager', name: '@deepseek-ai/dsh-mcp-manager', inject: ['credentials'] }]
        : [])
    } finally {
      rmSync(home, { recursive: true, force: true })
    }
  })
})

it('loads the local and remote RPent examples under separate tool namespaces', () => {
  const directory = new URL('../config/examples/rpent/', import.meta.url)
  const rows = composeEntries(['local.cordis.yml', 'remote.cordis.yml'].map(file =>
    loadOverlayPatches('dsh', fileURLToPath(new URL(file, directory))),
  ))

  expect(rows.map(({ id, name }) => ({ id, name }))).toEqual([
    { id: 'rpent-local-mcp', name: '@deepseek-ai/dsh-mcp-client' },
    { id: 'rpent-remote-mcp', name: '@deepseek-ai/dsh-mcp-client' },
  ])
  expect(rows[0]?.config).toMatchObject({ serverName: 'go2-01', url: 'http://127.0.0.1:8780/mcp' })
  expect(rows[1]?.config).toMatchObject({ serverName: 'rpent-remote', transport: 'streamable-http' })
})

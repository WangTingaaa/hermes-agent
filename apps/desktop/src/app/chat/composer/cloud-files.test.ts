import { describe, expect, it } from 'vitest'

import { cloudFileReference } from './cloud-files'

describe('cloudFileReference', () => {
  it('creates an explicit MCP-readable reference and normalizes the display name', () => {
    expect(
      cloudFileReference({
        id: 40605,
        fileName: '行业\n报告.pdf',
        parseStatus: 'SUCCESS'
      })
    ).toBe(
      '📎 已添加云端文件\n' +
        '📄 行业 报告.pdf\n' +
        '🆔 ID · 40605\n' +
        '✅ 解析完成\n\n' +
        '请通过 MesoInsights MCP 读取该文件内容后回答。\n'
    )
  })
})

describe('multi-source references', () => {
  it('preserves KB entry identity and team context', () => {
    expect(cloudFileReference({ id: 901, source: 'kb', kbId: 20, kbItemId: 44, fileName: 'kb.pdf' })).toContain(
      '知识库 ID · 20 / 条目 ID · 44'
    )
    expect(cloudFileReference({ id: 103, source: 'team', orgId: 3, fileName: 'team.pdf' })).toContain('组织 ID · 3')
  })
  it('local references use the native path and never ask MCP to read a folder ID', () => {
    const text = cloudFileReference({ id: 8, source: 'local', fileName: 'note.md', localPath: '/research/note.md' })
    expect(text).toContain('本机路径 · /research/note.md')
    expect(text).not.toContain('MCP')
    expect(text).toContain('远程连接无法访问此路径时，请先上传为附件')
  })
})

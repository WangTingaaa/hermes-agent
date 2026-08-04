import { describe, expect, it } from 'vitest'

import { cloudFavoriteReference } from './cloud-files'

describe('cloudFavoriteReference', () => {
  it('creates an explicit MCP-readable reference and normalizes the display name', () => {
    expect(
      cloudFavoriteReference({
        id: 40605,
        fileName: '行业\n报告.pdf',
        parseStatus: 'SUCCESS'
      })
    ).toBe(
      '📎 已添加云端收藏文件\n' +
        '📄 行业 报告.pdf\n' +
        '🆔 ID · 40605\n' +
        '✅ 解析完成\n\n' +
        '请通过 MesoInsights MCP 读取该文件内容后回答。\n'
    )
  })
})

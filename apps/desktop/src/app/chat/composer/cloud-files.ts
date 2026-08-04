export function cloudFavoriteReference(file: WenjingCloudFile): string {
  const fileName = file.fileName.replace(/\s+/g, ' ').trim()

  const statusLabels: Partial<Record<NonNullable<WenjingCloudFile['parseStatus']>, string>> = {
    FAILED: '解析失败',
    PARSING: '解析中',
    PENDING: '等待解析',
    PROCESSING: '解析中',
    SUCCESS: '解析完成'
  }
  const lines = ['📎 已添加云端收藏文件', `📄 ${fileName}`, `🆔 ID · ${file.id}`]

  if (file.parseStatus) {
    lines.push(`${file.parseStatus === 'SUCCESS' ? '✅' : '◌'} ${statusLabels[file.parseStatus]}`)
  }

  lines.push('', '请通过 MesoInsights MCP 读取该文件内容后回答。')

  return `${lines.join('\n')}\n`
}

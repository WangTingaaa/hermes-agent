import { notify } from '@/store/notifications'

import type { ChatBarProps } from './types'

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

export function createCloudFavoritePicker(insertText: (text: string) => void) {
  const cloudFiles = window.hermesDesktop?.cloudFiles

  if (!cloudFiles) {
    return undefined
  }

  return async () => {
    const file = await cloudFiles.pickFavorite()

    if (file) {
      insertText(cloudFavoriteReference(file))
    }
  }
}

export function createCloudFavoriteUploader(onAttachDroppedItems: ChatBarProps['onAttachDroppedItems']) {
  const cloudFiles = window.hermesDesktop?.cloudFiles

  if (!cloudFiles?.pickForUpload || !onAttachDroppedItems) {
    return undefined
  }

  return async () => {
    try {
      const file = await cloudFiles.pickForUpload()

      if (!file) {
        return
      }

      const attached = await onAttachDroppedItems([{ path: file.localPath }])

      if (attached !== false) {
        notify({ kind: 'success', message: `${file.fileName} 已添加为附件` })
      }
    } catch (error) {
      notify({
        kind: 'error',
        title: '云端文件下载失败',
        message: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }
}

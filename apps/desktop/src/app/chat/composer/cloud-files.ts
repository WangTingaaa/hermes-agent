import { useEffect, useRef } from 'react'

import { notify } from '@/store/notifications'

import type { CloudFileOptions } from './type'
import type { ChatBarProps } from './types'

export function cloudFileReference(file: WenjingCloudFile): string {
  const fileName = file.fileName.replace(/\s+/g, ' ').trim()

  const statusLabels: Partial<Record<NonNullable<WenjingCloudFile['parseStatus']>, string>> = {
    FAILED: '解析失败',
    PARSING: '解析中',
    PENDING: '等待解析',
    PROCESSING: '解析中',
    SUCCESS: '解析完成'
  }

  if (file.source === 'local') {
    return [
      '📎 已引用本地文件',
      `📄 ${fileName}`,
      `📂 本机路径 · ${file.localPath ?? ''}`,
      '',
      '请读取该本机文件后回答；远程连接无法访问此路径时，请先上传为附件。',
      ''
    ].join('\n')
  }

  const sourceLabels = { online: '云端', favorites: '收藏', kb: '知识库', team: '组织' }
  const lines = ['📎 已添加云端文件', `📄 ${fileName}`, `🆔 ID · ${file.id}`]

  if (file.source) {lines.push(`来源 · ${sourceLabels[file.source]}`)}

  if (file.source === 'kb') {lines.push(`知识库 ID · ${file.kbId} / 条目 ID · ${file.kbItemId}`)}

  if (file.source === 'team' && file.orgId) {lines.push(`组织 ID · ${file.orgId}`)}

  if (file.parseStatus) {
    lines.push(`${file.parseStatus === 'SUCCESS' ? '✅' : '◌'} ${statusLabels[file.parseStatus]}`)
  }

  lines.push('', '请通过 MesoInsights MCP 读取该文件内容后回答。')

  return `${lines.join('\n')}\n`
}

export function createCloudFilePicker(
  insertText: (text: string) => void,
  getScope: () => string | null | undefined = () => null
) {
  const cloudFiles = window.hermesDesktop?.cloudFiles

  if (!cloudFiles) {
    return undefined
  }

  return async () => {
    const scope = getScope()

    try {
      // 兼容尚未升级宿主预加载脚本的桌面运行环境。
      const file = await (cloudFiles.pick ?? cloudFiles.pickFavorite)()

      if (file && scope === getScope()) {insertText(cloudFileReference(file))}
    } catch (error) {
      notify({
        kind: 'error',
        title: '选择云端文件失败',
        message: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }
}

export function createCloudFileUploader(
  onAttachDroppedItems: ChatBarProps['onAttachDroppedItems'],
  getScope: () => string | null | undefined = () => null
) {
  const cloudFiles = window.hermesDesktop?.cloudFiles

  if (!cloudFiles?.pickForUpload || !onAttachDroppedItems) {
    return undefined
  }

  return async () => {
    const scope = getScope()

    try {
      const file = await cloudFiles.pickForUpload()

      if (!file || scope !== getScope()) {
        return
      }

      const attached = await onAttachDroppedItems([{ path: file.localPath }])

      if (attached !== false) {
        notify({ kind: 'success', message: `${file.fileName} 已添加为附件` })
      }
    } catch (error) {
      notify({
        kind: 'error',
        title: '添加文件失败',
        message: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }
}

/** 宿主选择器可能晚于会话切换返回，旧结果不写入新会话。 */
export function useCloudFiles({ insertText, onAttachDroppedItems, scopeRef }: CloudFileOptions) {
  const mounted = useRef(true)
  // eslint-disable-next-line no-restricted-syntax -- lifecycle guard for the native picker
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])
  const getScope = () => (mounted.current ? scopeRef.current : undefined)

  return {
    pickCloudFile: createCloudFilePicker(insertText, getScope),
    uploadCloudFile: createCloudFileUploader(onAttachDroppedItems, getScope)
  }
}

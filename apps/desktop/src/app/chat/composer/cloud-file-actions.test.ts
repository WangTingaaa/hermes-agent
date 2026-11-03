import { afterEach, expect, it, vi } from 'vitest'

import { createCloudFilePicker, createCloudFileUploader } from './cloud-files'

vi.mock('@/store/notifications', () => ({ notify: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())

it('uses the new picker and only falls back for older hosts without cloudFiles.pick', async () => {
  const pick = vi.fn().mockResolvedValue({ id: 1, fileName: 'new.pdf' })
  const pickFavorite = vi.fn().mockResolvedValue({ id: 2, fileName: 'old.pdf' })
  vi.stubGlobal('hermesDesktop', { cloudFiles: { pick, pickFavorite } })
  const insert = vi.fn()
  await createCloudFilePicker(insert)?.()
  expect(pick).toHaveBeenCalledOnce()
  expect(pickFavorite).not.toHaveBeenCalled()
  vi.stubGlobal('hermesDesktop', { cloudFiles: { pickFavorite } })
  await createCloudFilePicker(insert)?.()
  expect(pickFavorite).toHaveBeenCalledOnce()
})
it('cancelling or switching conversations while choosing never writes into the new conversation', async () => {
  let finish!: (value: WenjingCloudFile | null) => void

  const pick = vi.fn(
    () =>
      new Promise<WenjingCloudFile | null>(resolve => {
        finish = resolve
      })
  )

  vi.stubGlobal('hermesDesktop', { cloudFiles: { pick } })
  let scope = 'first'
  const insert = vi.fn()
  const pending = createCloudFilePicker(insert, () => scope)?.()
  scope = 'second'
  finish({ id: 1, fileName: 'old.pdf' })
  await pending
  expect(insert).not.toHaveBeenCalled()
  const cancelled = createCloudFilePicker(insert)?.()
  finish(null)
  await cancelled
  expect(insert).not.toHaveBeenCalled()
})
it('uploads verified local files through the attachment flow, with a scope guard', async () => {
  const pickForUpload = vi
    .fn()
    .mockResolvedValue({ id: 8, source: 'local', fileName: 'note.md', localPath: '/research/note.md' })

  vi.stubGlobal('hermesDesktop', { cloudFiles: { pickForUpload } })
  const attach = vi.fn().mockResolvedValue(true)
  await createCloudFileUploader(attach)?.()
  expect(attach).toHaveBeenCalledWith([{ path: '/research/note.md' }])
  attach.mockClear()
  let scope = 'first'
  pickForUpload.mockImplementationOnce(async () => {
    scope = 'second'

    return { id: 1, fileName: 'old.pdf', localPath: '/old.pdf' }
  })
  await createCloudFileUploader(attach, () => scope)?.()
  expect(attach).not.toHaveBeenCalled()
})

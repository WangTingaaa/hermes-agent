import { useStore } from '@nanostores/react'

import { $connection } from '@/store/session'

import { OfficePreview } from './office-preview'
import { filePathForTarget, LocalFilePreview } from './preview-file'
import type { LocalFilePreviewProps } from './type'

export function OfficeAwareFilePreview(props: LocalFilePreviewProps) {
  const connection = useStore($connection)
  const filePath = filePathForTarget(props.target)
  if (/\.(pptx?|docx?|xlsx?)$/i.test(filePath)) {
    return (
      <OfficePreview
        owner={{ connectionId: connection?.connectionId, profile: connection?.profile }}
        path={filePath}
        title={props.target.label}
      />
    )
  }
  return <LocalFilePreview {...props} />
}

import { openSession } from '@/app/open-session'
import {
  createGatewaySession,
  desktopSessionCreateParams
} from '@/app/session/hooks/use-session-actions/session-create-request'
import { upsertOptimisticSession } from '@/app/session/hooks/use-session-actions/utils'
import type { ArtifactFileActionCopy } from '@/i18n/artifact-files/type'
import { requestGatewayForAgent } from '@/store/gateway'
import { sessionTileDelegate } from '@/store/session-states'

import type { ArtifactRecord } from '../artifact-utils'

import type { ArtifactFileOwner, ArtifactUploadNavigate } from './type'

/** One new chat on the file's owner, submitted through the existing session
 * delegate. Its upload tool and credentials remain owned by that backend. */
export async function uploadArtifactToCloud(
  artifact: ArtifactRecord,
  owner: ArtifactFileOwner,
  copy: ArtifactFileActionCopy,
  navigate: ArtifactUploadNavigate
) {
  const picker = window.hermesDesktop?.artifactFiles?.pickCloudFolder
  const destination = picker ? await picker() : undefined

  if (destination === null) {return}

  const delegate = sessionTileDelegate()

  if (!delegate) {
    throw new Error('The session connection is not ready')
  }

  const prompt = copy.uploadPrompt(artifact.label, artifact.value, artifact.sessionId, destination?.folderId)
  const params = await desktopSessionCreateParams('', owner, owner.profile, false, false)

  const created = await createGatewaySession(
    owner,
    params,
    <T>(method: string, requestParams?: Record<string, unknown>) =>
      requestGatewayForAgent<T>(owner.connectionId, owner.profile, method, requestParams)
  )

  const storedId = created.stored_session_id

  if (!storedId) {
    throw new Error('The new session did not return a stored id')
  }

  upsertOptimisticSession(created, storedId, null, prompt, null, undefined, owner)
  const runtimeId = await delegate.resumeTile(storedId)
  openSession(storedId, navigate, 'tab')
  const accepted = await delegate.submitToSession(runtimeId, prompt)

  if (accepted.storedSessionId !== storedId) {
    throw new Error('Cloud upload task acceptance could not be verified; check the new conversation before retrying')
  }
}

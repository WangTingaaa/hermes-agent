import { beforeEach, describe, expect, it } from 'vitest'

import {
  $backendCompatibility,
  BACKEND_CAPABILITIES,
  backendMeetsMinimumContract,
  backendOwnerKey,
  backendSupports,
  LEGACY_BACKEND_CONTRACT,
  publishBackendCompatibility
} from './backend-compatibility'

describe('backend compatibility', () => {
  beforeEach(() => $backendCompatibility.set(null))

  it('enables a feature only when the active backend advertises it', () => {
    publishBackendCompatibility(
      { desktop_capabilities: [BACKEND_CAPABILITIES.foreignSessionImport], desktop_contract: 7 },
      'primary',
      'default'
    )
    const snapshot = $backendCompatibility.get()

    expect(backendSupports(snapshot, backendOwnerKey('primary', 'default'), 'session.foreign')).toBe(true)
    expect(backendSupports(snapshot, backendOwnerKey('other', 'default'), 'session.foreign')).toBe(false)
  })

  it('treats a pre-capability backend as supported for core UI but not new features', () => {
    publishBackendCompatibility({}, null, 'default')
    const snapshot = $backendCompatibility.get()
    const ownerKey = backendOwnerKey(null, 'default')

    expect(snapshot?.contract).toBe(LEGACY_BACKEND_CONTRACT)
    expect(backendMeetsMinimumContract(snapshot, ownerKey)).toBe(true)
    expect(backendSupports(snapshot, ownerKey, BACKEND_CAPABILITIES.foreignSessionImport)).toBe(false)
  })

  it('rejects an explicitly reported contract below the core minimum', () => {
    publishBackendCompatibility({ desktop_contract: 0 }, 'primary', 'default')

    expect(backendMeetsMinimumContract($backendCompatibility.get(), backendOwnerKey('primary', 'default'))).toBe(false)
  })
})

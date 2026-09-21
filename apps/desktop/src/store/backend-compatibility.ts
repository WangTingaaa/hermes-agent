import { atom } from 'nanostores'

import type { SessionRuntimeInfo } from '@/types/hermes'

export const MINIMUM_BACKEND_CONTRACT = 1
export const LEGACY_BACKEND_CONTRACT = 1

export const BACKEND_CAPABILITIES = {
  foreignSessionImport: 'session.foreign'
} as const

export interface BackendCompatibilitySnapshot {
  capabilities: readonly string[]
  contract: number
  ownerKey: string
}

export const $backendCompatibility = atom<BackendCompatibilitySnapshot | null>(null)

export function backendOwnerKey(connectionId: null | string | undefined, profile: null | string | undefined): string {
  return `${connectionId || 'local'}:${profile?.trim() || 'default'}`
}

export function publishBackendCompatibility(
  info: SessionRuntimeInfo,
  connectionId: null | string | undefined,
  profile: null | string | undefined
): void {
  $backendCompatibility.set({
    capabilities: Array.isArray(info.desktop_capabilities) ? [...new Set(info.desktop_capabilities)] : [],
    // Backends released before contract reporting are the compatibility
    // baseline. Keeping that baseline explicit means a future breaking
    // renderer can raise MINIMUM_BACKEND_CONTRACT and block them correctly.
    contract: Number.isFinite(info.desktop_contract) ? Number(info.desktop_contract) : LEGACY_BACKEND_CONTRACT,
    ownerKey: backendOwnerKey(connectionId, profile)
  })
}

export function backendSupports(
  snapshot: BackendCompatibilitySnapshot | null,
  ownerKey: string,
  capability: string
): boolean {
  return snapshot?.ownerKey === ownerKey && snapshot.capabilities.includes(capability)
}

export function backendMeetsMinimumContract(snapshot: BackendCompatibilitySnapshot | null, ownerKey: string): boolean {
  // Do not block a connecting surface before its authoritative session.info
  // arrives. Feature capabilities remain unavailable until they are advertised.
  return snapshot?.ownerKey !== ownerKey || snapshot.contract >= MINIMUM_BACKEND_CONTRACT
}

import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'

import { getHermesConfigRecord } from '@/hermes'
import { queryClient, writeCache } from '@/lib/query-client'
import { $activeGatewayProfile, normalizeProfileKey } from '@/store/profile'
import type { HermesConfigRecord } from '@/types/hermes'

// One shared cache root for profile config records (`GET /api/config`). Every
// settings surface (MCP, model, config) reads and writes through the active
// profile's child key so a save in one shows in the others without leaking
// profile A's config into profile B.
//
// Distinct from session/hooks/use-hermes-config.ts, which is side-effecting —
// it pushes personality/cwd/voice/… into the session stores for live chat.
export const HERMES_CONFIG_KEY = ['hermes-config-record'] as const

export const hermesConfigKey = (profile: string) => [...HERMES_CONFIG_KEY, normalizeProfileKey(profile)] as const

// staleTime 0 → serve cache instantly, background-revalidate on every mount.
export const useHermesConfigRecord = () => {
  const profile = useStore($activeGatewayProfile)

  return useQuery({ queryKey: hermesConfigKey(profile), queryFn: getHermesConfigRecord, staleTime: 0 })
}

export const setHermesConfigCache = (
  next:
    | HermesConfigRecord
    | undefined
    | ((prev: HermesConfigRecord | undefined) => HermesConfigRecord | undefined)
): void => writeCache<HermesConfigRecord>(hermesConfigKey($activeGatewayProfile.get()))(next)

// Prefix invalidation refreshes every cached profile; the mounted profile is
// refetched immediately and inactive profiles remain correctly partitioned.
export const invalidateHermesConfig = () => queryClient.invalidateQueries({ queryKey: HERMES_CONFIG_KEY })

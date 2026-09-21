import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useState } from 'react'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import type { MiraRuntimeState } from '@/global'
import { getStatus } from '@/hermes'
import { type Translations, useI18n } from '@/i18n'
import { CheckCircle2, FileText, Loader2, RefreshCw } from '@/lib/icons'
import { cn } from '@/lib/utils'
import {
  $updateApply,
  $updateChecking,
  $updateStatus,
  checkUpdates,
  openUpdatesWindow,
  startActiveUpdate
} from '@/store/updates'

import { MiraRuntimeUpdateDialog } from './mira-runtime-update-dialog'
import { SectionHeading, SettingsContent } from './primitives'

const MIRA_DESKTOP_FALLBACK_VERSION = '0.3.13'

interface HostVersionInfo {
  backend?: string | null
  desktop?: string
}

interface MiraVersions {
  agent: string | null
  desktop: string
  loaded: boolean
}

function relativeTime(ms: number | null | undefined, a: Translations['settings']['about']) {
  if (!ms) {
    return a.never
  }

  const diff = Date.now() - ms

  if (diff < 60_000) {
    return a.justNow
  }

  if (diff < 3_600_000) {
    return a.minAgo(Math.round(diff / 60_000))
  }

  if (diff < 86_400_000) {
    return a.hoursAgo(Math.round(diff / 3_600_000))
  }

  return a.daysAgo(Math.round(diff / 86_400_000))
}

export function MiraAboutSettings() {
  const { t } = useI18n()
  const a = t.settings.about
  const status = useStore($updateStatus)
  const apply = useStore($updateApply)
  const checking = useStore($updateChecking)
  const runtimeBridge = window.hermesDesktop?.runtime
  const [justChecked, setJustChecked] = useState(false)
  const [runtimeChecking, setRuntimeChecking] = useState(false)
  const [runtimeDialogOpen, setRuntimeDialogOpen] = useState(false)
  const [runtimeState, setRuntimeState] = useState<MiraRuntimeState | null>(null)

  const [versions, setVersions] = useState<MiraVersions>({
    agent: null,
    desktop: MIRA_DESKTOP_FALLBACK_VERSION,
    loaded: false
  })

  const refreshVersions = useCallback(async () => {
    const [hostResult, agentResult] = await Promise.allSettled([
      window.hermesDesktop?.getVersion?.() as Promise<HostVersionInfo | undefined>,
      getStatus()
    ])

    const host = hostResult.status === 'fulfilled' ? hostResult.value : undefined
    const agent = agentResult.status === 'fulfilled' ? agentResult.value.version : null

    setVersions({
      agent: agent || host?.backend || null,
      desktop: host?.desktop || MIRA_DESKTOP_FALLBACK_VERSION,
      loaded: true
    })
  }, [])

  useEffect(() => {
    void refreshVersions()
  }, [refreshVersions])

  useEffect(() => {
    if (!runtimeBridge) {
      return undefined
    }

    const unsubscribe = runtimeBridge.onState(setRuntimeState)
    void runtimeBridge
      .getState()
      .then(setRuntimeState)
      .catch(error => {
        setRuntimeState({
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      })

    return unsubscribe
  }, [runtimeBridge])

  const usingHostRuntime = Boolean(runtimeBridge)
  const behind = status?.behind ?? 0
  const updateAvailable = usingHostRuntime ? Boolean(runtimeState?.updateAvailable) : behind > 0
  const supported = usingHostRuntime || status?.supported !== false

  const applying = usingHostRuntime
    ? runtimeState?.status === 'installing'
    : apply.applying || apply.stage === 'restart'

  const activelyChecking = usingHostRuntime ? runtimeChecking : checking
  const checkedAt = usingHostRuntime ? runtimeState?.checkedAt : status?.fetchedAt

  const handleCheck = async () => {
    setJustChecked(false)

    if (runtimeBridge) {
      setRuntimeChecking(true)

      try {
        const next = await runtimeBridge.check()
        setRuntimeState(next)
        await refreshVersions()
        setJustChecked(true)
      } catch (error) {
        setRuntimeState(current => ({
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        }))
      } finally {
        setRuntimeChecking(false)
      }

      return
    }

    const next = await checkUpdates()
    await refreshVersions()
    setJustChecked(Boolean(next))
  }

  const handleRuntimeUpdate = async () => {
    if (!runtimeBridge) {
      return
    }

    try {
      const result = (await runtimeBridge.update()) as { restarting?: boolean } | undefined
      if (result?.restarting) {
        return
      }
      await refreshVersions()
    } catch (error) {
      setRuntimeState(current => ({
        ...current,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      }))
    }
  }

  let statusLine: string
  let statusTone: 'idle' | 'available' | 'error' = 'idle'

  if (!supported) {
    statusLine = status?.message ?? a.cantUpdate
    statusTone = 'error'
  } else if (usingHostRuntime && runtimeState?.error) {
    statusLine = runtimeState.error
    statusTone = 'error'
  } else if (!usingHostRuntime && status?.error) {
    statusLine = a.cantReach
    statusTone = 'error'
  } else if (applying) {
    statusLine = usingHostRuntime
      ? a.runtimeUpdating(runtimeState?.bundledVersion, Math.round(runtimeState?.progress || 0))
      : a.installing
    statusTone = 'available'
  } else if (updateAvailable) {
    statusLine = usingHostRuntime
      ? a.runtimeUpdateReady(runtimeState?.installedVersion, runtimeState?.bundledVersion)
      : a.updateReady(behind)
    statusTone = 'available'
  } else if (runtimeState || status) {
    statusLine = a.onLatest
  } else {
    statusLine = a.tapCheck
  }

  const agentVersion = runtimeState?.installedVersion || versions.agent

  const agentVersionLine = agentVersion
    ? `Mira Agent v${agentVersion}`
    : versions.loaded
      ? `Mira Agent · ${a.versionUnavailable}`
      : 'Mira Agent · …'

  const releaseVersion =
    versions.agent && a.runtimeReleaseNotes[versions.agent] ? versions.agent : Object.keys(a.runtimeReleaseNotes)[0]

  const runtimeNotes = releaseVersion ? a.runtimeReleaseNotes[releaseVersion] : []

  const releaseNotes = runtimeState?.bundledVersion ? a.runtimeReleaseNotes[runtimeState.bundledVersion] || [] : []

  return (
    <SettingsContent>
      <div className="flex flex-col items-center gap-3 pt-6 pb-2 text-center">
        <BrandMark className="size-16" />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{a.heading}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{agentVersionLine}</p>
        </div>
      </div>

      <div className="mx-auto mt-4 w-full max-w-2xl">
        <SectionHeading icon={RefreshCw} title={a.updates} />

        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            statusTone === 'available' && 'border-primary/30 bg-primary/5 text-foreground',
            statusTone === 'error' && 'border-destructive/35 bg-destructive/5 text-destructive',
            statusTone === 'idle' && 'border-border/70 bg-muted/20 text-foreground'
          )}
        >
          <div className="flex items-start gap-2">
            {statusTone === 'available' ? (
              <Codicon className="mt-0.5 size-4 shrink-0 text-primary" name="cloud-download" size="1rem" />
            ) : statusTone === 'error' ? null : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <div className="min-w-0">
              <p className="font-medium">{statusLine}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.lastChecked(relativeTime(checkedAt, a))}
                {justChecked && !activelyChecking ? a.justNowSuffix : ''}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Button
              disabled={activelyChecking || applying || !supported}
              onClick={() => void handleCheck()}
              size="sm"
              variant="textStrong"
            >
              {activelyChecking ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {activelyChecking ? a.checking : a.checkNow}
            </Button>

            {updateAvailable && supported && !applying && (
              <>
                <Button
                  onClick={() => {
                    if (usingHostRuntime) {
                      setRuntimeDialogOpen(true)
                    } else {
                      startActiveUpdate()
                    }
                  }}
                  size="sm"
                >
                  {a.updateNow}
                </Button>
                {!usingHostRuntime && (
                  <Button onClick={() => openUpdatesWindow()} size="sm" variant="textStrong">
                    {a.seeWhatsNew}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        {!usingHostRuntime && behind > 0 && releaseVersion && runtimeNotes.length > 0 && (
          <div className="mt-6">
            <SectionHeading icon={FileText} title={`${a.releaseNotes} · ${releaseVersion}`} />
            <ul className="space-y-2 rounded-xl border border-border/70 bg-muted/20 px-5 py-4 text-sm text-foreground">
              {runtimeNotes.map(note => (
                <li className="list-disc leading-6 marker:text-primary" key={note}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* <ListRow
          description={a.automaticUpdatesDesc}
          hint={a.branchCommit(status?.branch ?? 'unknown', status?.currentSha?.slice(0, 7) ?? 'unknown')}
          title={a.automaticUpdates}
        /> */}
      </div>

      {usingHostRuntime && (
        <MiraRuntimeUpdateDialog
          notes={releaseNotes}
          onOpenChange={setRuntimeDialogOpen}
          onUpdate={() => void handleRuntimeUpdate()}
          open={runtimeDialogOpen}
          state={runtimeState}
        />
      )}
    </SettingsContent>
  )
}

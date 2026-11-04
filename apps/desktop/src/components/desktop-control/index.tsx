import './index.css'

import { useStore } from '@nanostores/react'
import { ArrowUpRight, Check, Circle, CircleX, Monitor, MousePointer2, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useComposerScope } from '@/app/chat/composer/scope'
import { usePaneVisible } from '@/components/pane-shell/pane-visibility'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { dialedGatewayModeFor } from '@/store/gateway'
import { $activeGatewayProfile } from '@/store/profile'
import { $gatewayState } from '@/store/session'

import { desktopActions } from './actions'
import { currentDesktopTurn, desktopOperation } from './operation'
import { desktopCompletion, previewEmpty } from './presentation'
import { PreviewSurface } from './preview-surface'
import type { DesktopAction, DesktopControlProps } from './type'
import { useOperationPreview } from './use-operation-preview'

export function DesktopControl(props: DesktopControlProps) {
  const visible = usePaneVisible()

  const messages = useStore(props.messagesStore)
  const turnId = messages.findLast(message => message.role === 'user')?.id || ''

  return visible && !props.hidden ? <DesktopControlBody key={`${props.sessionId}:${turnId}`} {...props} /> : null
}

function DesktopControlBody({ messagesStore, busy, onStop }: DesktopControlProps) {
  const messages = useStore(messagesStore)
  const profile = useStore($activeGatewayProfile)
  const gatewayState = useStore($gatewayState)
  const scope = useComposerScope()

  const local =
    gatewayState === 'open' && dialedGatewayModeFor(scope.connectionId ?? null, scope.profile || profile) === 'local'

  const { locale, t } = useI18n()
  const copy = t.desktopControl
  const zh = locale.startsWith('zh')
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const operation = useMemo(() => desktopOperation(messages), [messages])
  const actions = useMemo(() => desktopActions(currentDesktopTurn(messages)), [messages])
  const capture = useOperationPreview(operation.target, local && !dismissed, busy)
  const frame = capture.frame || operation.frame || null

  if (dismissed || (!operation.target.app && !operation.target.windowTitle && !operation.frame)) {
    return null
  }

  const latest = actions.at(-1)
  const name = frame?.name || operation.target.windowTitle || operation.target.app || 'Mira Desktop'
  const { failed, interrupted, state: completedState, result } = desktopCompletion(messages, copy)
  const state = busy ? (zh ? '正在操作' : 'Working') : completedState
  const empty = previewEmpty(local, capture.error, operation.target, zh)

  const status = {
    running: zh ? '执行中' : 'Running',
    success: zh ? '已验证完成' : 'Verified',
    failed: zh ? '执行失败' : 'Failed',
    unconfirmed: zh ? '工具已返回' : 'Tool returned'
  }

  function actionName(name: string) {
    const names: Record<string, string> = zh
      ? {
          terminal: '执行命令',
          browser_exec: '浏览器操作',
          vision_analyze: '查看画面',
          capture: '查看窗口',
          click: '点击',
          double_click: '双击',
          right_click: '右键点击',
          drag: '拖动',
          scroll: '滚动',
          type: '输入内容',
          key: '键盘操作',
          focus_app: '切换应用',
          launch_app: '打开应用',
          set_value: '设置内容',
          wait: '等待'
        }
      : { terminal: 'Run command', browser_exec: 'Browser action', vision_analyze: 'Inspect image' }

    return names[name] || name
  }

  function renderPreview() {
    return <PreviewSurface empty={empty} frame={frame} label={name} pointer={operation.pointer} />
  }

  function renderThumbnail() {
    return (
      <DialogTrigger asChild>
        <button
          aria-label={busy ? (zh ? '展开 Mira 操作画面' : 'Expand Mira operation view') : copy.viewResult}
          className="mira-control__thumbnail"
        >
          <div className="mira-control__mini-heading">
            <Monitor size={13} />
            <strong>Mira Desktop</strong>
            <span data-busy={busy}>{state}</span>
          </div>
          {busy ? (
            renderPreview()
          ) : (
            <div className="mira-control__completed" data-failed={failed} role="status">
              {failed ? (
                <CircleX aria-hidden="true" size={36} />
              ) : interrupted ? (
                <Circle aria-hidden="true" size={36} />
              ) : (
                <Check aria-hidden="true" size={36} strokeWidth={1.5} />
              )}
              <span>{copy.viewResult}</span>
            </div>
          )}
          <div className="mira-control__mini-footer">
            <span title={name}>{name}</span>
            <ArrowUpRight size={14} />
          </div>
        </button>
      </DialogTrigger>
    )
  }

  function renderAction(action: DesktopAction) {
    return (
      <li data-status={action.status} key={action.id}>
        {action.status === 'success' ? <Check size={14} /> : <Circle size={12} />}
        <div>
          <strong title={action.app || action.name}>
            {action.app ? `${action.app} · ` : ''}
            {actionName(action.name)}
          </strong>
          <span>
            {!busy && action.status === 'running' ? (zh ? '等待最终回执' : 'Awaiting receipt') : status[action.status]}
          </span>
        </div>
        {action.duration !== undefined && <small>{action.duration.toFixed(1)}s</small>}
      </li>
    )
  }

  function renderTimeline() {
    return (
      <aside aria-label={zh ? '操作动态' : 'Activity'} className="mira-control__timeline">
        <div className="mira-control__section-title">
          <MousePointer2 size={14} />
          <strong>{zh ? '操作动态' : 'Activity'}</strong>
          <span>{actions.length}</span>
        </div>
        {!actions.length && (
          <p className="mira-control__hint">
            {zh ? '开始操作后，动态会显示在这里。' : 'Activity appears here when Mira starts working.'}
          </p>
        )}
        <ol>{actions.slice().reverse().map(renderAction)}</ol>
      </aside>
    )
  }

  function renderHeader() {
    return (
      <header className="mira-control__header">
        <span className="mira-control__brand">
          <Monitor size={20} />
        </span>
        <div>
          <DialogTitle>Mira Desktop</DialogTitle>
          <DialogDescription>{zh ? '跟随 Mira 的当前操作' : 'Follow Mira’s current operation'}</DialogDescription>
        </div>
        <span className="mira-control__status" data-busy={busy}>
          {state}
        </span>
      </header>
    )
  }

  function renderStage() {
    return (
      <section className="mira-control__stage">
        <div className="mira-control__section-title">
          <span title={name}>{name}</span>
          <span>
            {capture.frame && busy && !capture.error ? 'LIVE' : frame ? (zh ? '最近画面' : 'Latest capture') : state}
          </span>
        </div>
        {renderPreview()}
        <p className="mira-control__hint">
          {zh ? '自动跟随操作窗口 · 适应画面' : 'Automatically follows the operation window · Fit to view'}
        </p>
        {capture.error && (
          <div className="mira-control__error" role="alert">
            <p>
              {zh
                ? {
                    unavailable: '请重启 Mira，加载桌面预览更新。',
                    'window-unavailable': '当前操作窗口暂不可采集。请保持该窗口打开，预览会自动重连。',
                    permission: '请为当前宿主应用开启屏幕录制权限，并完全退出后重新打开。',
                    'capture-failed': '窗口预览发生错误，请重试。'
                  }[capture.error]
                : {
                    unavailable: 'Restart Mira to load the preview update.',
                    'window-unavailable':
                      'The operation window is unavailable. Keep it open; preview reconnects automatically.',
                    permission: 'Allow screen recording for the host application, then quit and reopen it.',
                    'capture-failed': 'Window preview failed. Please retry.'
                  }[capture.error]}
            </p>
            <Button onClick={capture.retry} size="sm" variant="secondary">
              {zh ? '重试' : 'Retry'}
            </Button>
          </div>
        )}
      </section>
    )
  }

  function handleDismiss() {
    setOpen(false)
    setDismissed(true)
  }

  function renderResult() {
    return (
      !busy && (
        <section aria-label={copy.resultHeading} className="mira-control__result">
          <strong>{copy.resultHeading}</strong>
          <p>{result || copy.noResult}</p>
        </section>
      )
    )
  }

  function renderExpanded() {
    return (
      <DialogContent className="mira-control__dialog" showCloseButton>
        {renderHeader()}
        <div className="mira-control__body">
          {renderStage()}
          {renderTimeline()}
        </div>
        {renderResult()}
        <footer className="mira-control__footer">
          <span className="mira-control__hint">
            {latest ? `${actionName(latest.name)} · ${status[latest.status]}` : state}
          </span>
          {busy && (
            <Button onClick={() => onStop()} size="sm" variant="outline">
              {zh ? '结束任务' : 'Stop task'}
            </Button>
          )}
        </footer>
      </DialogContent>
    )
  }

  return (
    <div className="mira-control">
      <Dialog onOpenChange={setOpen} open={open}>
        {renderThumbnail()}
        {renderExpanded()}
      </Dialog>
      {!busy && (
        <div className="mira-control__dismiss">
          <Tip label={copy.dismiss}>
            <Button aria-label={copy.dismiss} onClick={handleDismiss} size="icon-xs" variant="ghost">
              <X size={12} />
            </Button>
          </Tip>
        </div>
      )}
    </div>
  )
}

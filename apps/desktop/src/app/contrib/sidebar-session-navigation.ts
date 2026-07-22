import type { AppView } from '../routes'

/** A focused workspace tile only avoids navigation while the chat route is visible. */
export function shouldNavigateToSidebarSession(currentView: AppView, focusedOpenSession: boolean): boolean {
  return currentView !== 'chat' || !focusedOpenSession
}

import { atom } from 'nanostores'

// The overview belongs to the initial landing page. Explicit new chats keep
// only the welcome and composer; this presentation choice resets on app load.
export const $showWorkspaceOverview = atom(true)

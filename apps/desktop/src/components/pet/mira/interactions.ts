import type { KeyboardEvent, MouseEvent } from 'react'

import { openMiraWardrobe, reactWithMira } from '@/store/pet-personalization'

export function handleMiraClick(): void {
  reactWithMira()
}

export function handleMiraContextMenu(event: MouseEvent): void {
  event.preventDefault()
  openMiraWardrobe()
}

export function handleMiraKeyDown(event: KeyboardEvent): void {
  if (!['Enter', ' '].includes(event.key)) {
    return
  }

  event.preventDefault()
  openMiraWardrobe()
}

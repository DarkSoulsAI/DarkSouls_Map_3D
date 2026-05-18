import { create } from 'zustand'
import type { Bonfire } from '../types'
import bonfireData from '../data/bonfires.json'

interface AppState {
  bonfires: Bonfire[]
  currentBonfireId: string | null
  sidebarOpen: boolean
  visitedIds: Set<string>
  mode: 'cinema' | 'free'

  setCurrentBonfire: (id: string) => void
  closeSidebar: () => void
  nextBonfire: () => void
  prevBonfire: () => void
  setMode: (mode: 'cinema' | 'free') => void
}

const sortedBonfires = [...(bonfireData as Bonfire[])].sort((a, b) => a.order - b.order)

export const useAppStore = create<AppState>((set, get) => ({
  bonfires: sortedBonfires,
  currentBonfireId: null,
  sidebarOpen: false,
  visitedIds: new Set(),
  mode: 'free',

  setCurrentBonfire: (id) => {
    set(state => ({
      currentBonfireId: id,
      sidebarOpen: true,
      visitedIds: new Set([...state.visitedIds, id]),
    }))
  },

  closeSidebar: () => set({ sidebarOpen: false, currentBonfireId: null }),

  nextBonfire: () => {
    const { bonfires, currentBonfireId } = get()
    const idx = bonfires.findIndex(b => b.id === currentBonfireId)
    if (idx < bonfires.length - 1) {
      get().setCurrentBonfire(bonfires[idx + 1].id)
    }
  },

  prevBonfire: () => {
    const { bonfires, currentBonfireId } = get()
    const idx = bonfires.findIndex(b => b.id === currentBonfireId)
    if (idx > 0) {
      get().setCurrentBonfire(bonfires[idx - 1].id)
    }
  },

  setMode: (mode) => set({ mode }),
}))

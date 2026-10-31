import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  paymentOutcome: 'random' | 'success' | 'fail'
  setUser: (user: User | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  setPaymentOutcome: (outcome: 'random' | 'success' | 'fail') => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      paymentOutcome: 'random',
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setPaymentOutcome: (paymentOutcome) => set({ paymentOutcome }),
      logout: () => {
        localStorage.removeItem('brightloop_app_data_v1')
        set({ user: null })
      },
    }),
    { name: 'brightloop_session_v1' }
  )
)

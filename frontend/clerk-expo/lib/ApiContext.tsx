import React, { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@clerk/expo'
import { ApiClient, createApiClient } from './api'

const ApiContext = createContext<ApiClient | null>(null)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  const apiClient = useMemo(() => {
    // We pass a thunk to get the freshest token on every request
    return createApiClient(async () => {
      try {
        return await getToken()
      } catch (err) {
        console.warn('Failed to get Clerk token:', err)
        return null
      }
    })
  }, [getToken])

  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>
}

export function useApiClient() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApiClient must be used within an ApiProvider')
  }
  return context
}

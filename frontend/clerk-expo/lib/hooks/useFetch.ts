import { useState, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFetch<T, Args extends any[]>(
  fetcher: (...args: Args) => Promise<T>,
  initialValue: T | null = null,
) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialValue,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const data = await fetcher(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState({ data: null, loading: false, error })
        throw error
      }
    },
    [fetcher],
  )

  const reset = useCallback(() => {
    setState({ data: initialValue, loading: false, error: null })
  }, [initialValue])

  return { ...state, execute, reset }
}

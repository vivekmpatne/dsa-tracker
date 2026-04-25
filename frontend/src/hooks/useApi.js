import { useState, useEffect, useCallback } from 'react'

export const useApi = (apiFn, deps = [], options = {}) => {
  const { immediate = true, onSuccess, onError } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)

      // ✅ FIX: unwrap backend response properly
      const finalData = res.data?.data || res.data

      setData(finalData)
      onSuccess?.(finalData)
      return finalData
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      setError(msg)
      onError?.(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute])

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, execute, refetch }
}
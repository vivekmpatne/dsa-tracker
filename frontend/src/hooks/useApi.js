// frontend/src/hooks/useApi.js
// A reusable hook that wraps any async API call with loading / error / data state.
//
// Usage:
//   const { data, loading, error, execute } = useApi(statsApi.getDashboard);
//   useEffect(() => { execute(); }, []);
//
//   const { loading, execute: createEntry } = useApi(progressApi.create);
//   await createEntry(payload);   // returns the result too

import { useState, useCallback } from "react";

export default function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // execute() accepts the same args apiFn expects and returns the result.
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;          // ← callers can await the return value
      } catch (err) {
        setError(err.message || "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  // reset clears all state (handy before re-fetching)
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
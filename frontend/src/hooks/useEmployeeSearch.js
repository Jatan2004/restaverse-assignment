/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Custom hook: debounced employee search
 *
 * - Debounces the raw search input by 300 ms
 * - Fires GET /employees/all by default, and GET /employees?search=<term> when searching
 * - Cancels in-flight requests via AbortController when the term changes fast
 * - Exposes: { data, loading, error, searchTerm, setSearchTerm, retry, refresh }
 */
export default function useEmployeeSearch() {
  const [searchTerm, setSearchTerm] = useState("");   // raw input value
  const [debounced, setDebounced] = useState("");      // settled value after 300 ms
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep an AbortController ref so we can cancel stale requests
  const abortRef = useRef(null);

  // ── Debounce & Instant Loading: update debounced and reset/load states ──
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setDebounced("");
      return;
    }

    // Instantly transition to loading state when typing starts to prevent UX flicker
    setLoading(true);

    const timer = setTimeout(() => {
      setDebounced(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch employees whenever the debounced search term changes ────────────
  const fetchEmployees = useCallback(async (term) => {
    // Cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const isSearch = term && term.trim();
      const url = isSearch
        ? `${API_BASE}/employees?search=${encodeURIComponent(term.trim())}`
        : `${API_BASE}/employees/all`;

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail || `Server error: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      // Ignore AbortError – it means a newer request took over
      if (err.name === "AbortError") return;
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure the backend is running on port 8000."
          : err.message
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(debounced);

    // Abort active fetches when the component unmounts to prevent memory leaks
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [debounced, fetchEmployees]);

  // Manual retry using the current debounced term
  const retry = useCallback(() => fetchEmployees(debounced), [debounced, fetchEmployees]);

  // Refresh helper
  const refresh = useCallback(() => fetchEmployees(debounced), [debounced, fetchEmployees]);

  return { data, loading, error, searchTerm, setSearchTerm, retry, refresh };
}

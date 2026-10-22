import { useState, useCallback } from "react";
import { api } from "@/lib/api";

interface UsePaginationOptions {
  url: string;
  limit?: number;
  initialPage?: number;
  filters?: Record<string, any>;
}

/**
 * Hook for handling paginated API requests
 */
export function usePagination<T>(options: UsePaginationOptions) {
  const { url, limit = 10, initialPage = 1, filters = {} } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value.toString());
        }
      });

      const { data: response } = await api.get(`${url}?${params.toString()}`);
      
      setData(response.data || response.users || response.leads || response.applications || response.content || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [url, page, limit, filters]);

  return {
    data,
    page,
    totalPages,
    total,
    loading,
    setPage,
    refresh: fetchData,
  };
}
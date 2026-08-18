"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiResponse } from "./apiClient";

interface UseApiOptions<T> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  path: string,
  queryParams?: Record<string, string | number | undefined>,
  options: UseApiOptions<T> = {}
) {
  const { autoFetch = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const queryParamsSerialized = JSON.stringify(queryParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res: ApiResponse<T> = await apiClient.get<T>(path, queryParams);

    if (res.error) {
      setError(res.error);
      if (onError) onError(res.error);
    } else if (res.data !== undefined) {
      setData(res.data);
      if (onSuccess) onSuccess(res.data);
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, queryParamsSerialized, queryParams, onError, onSuccess]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}

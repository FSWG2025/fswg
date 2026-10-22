import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UseFormSubmitOptions {
  url: string;
  method?: "post" | "put" | "patch" | "delete";
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for handling form submissions with loading state and toast notifications
 */
export function useFormSubmit(options: UseFormSubmitOptions) {
  const {
    url,
    method = "post",
    successMessage = "Success!",
    onSuccess,
    onError,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data?: any) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await api[method](url, data);
        
        if (successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "An error occurred. Please try again.";
        
        setError(errorMessage);
        toast.error(errorMessage);
        onError?.(err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [url, method, successMessage, onSuccess, onError]
  );

  return {
    submit,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
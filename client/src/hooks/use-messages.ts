import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl, type MessageInput, type MessageResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: async (data: MessageInput) => {
      const validated = api.messages.create.input.parse(data);
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.messages.create.responses[400], await res.json(), "create.error");
          throw new Error(error.message);
        }
        throw new Error("Failed to create secret message");
      }

      return parseWithLogging(api.messages.create.responses[201], await res.json(), "create.success");
    },
  });
}

export function useMessage(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [api.messages.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.messages.get.path, { id });
      const res = await fetch(url);
      
      if (res.status === 404) {
        throw new Error("Secret not found. It may have already been destroyed or never existed.");
      }
      
      if (!res.ok) {
        throw new Error("Failed to retrieve secret");
      }

      return parseWithLogging(api.messages.get.responses[200], await res.json(), "get.success");
    },
    // CRITICAL: Only fetch when explicitly revealed to prevent accidental prefetching from burning the read
    enabled: enabled,
    // CRITICAL: Never retry a one-time read. If it fails or is 404, it's gone.
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}

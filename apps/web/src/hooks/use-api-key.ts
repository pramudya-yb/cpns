import { useState, useEffect, useCallback } from "react";
import { encryptText, decryptText } from "@/lib/crypto";

const STORAGE_KEY = "labas_api_keys_v2";

export interface ApiKeyConfig {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens?: number;
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useApiKeys() {
  const [configs, setConfigs] = useState<ApiKeyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        const decrypted = await decryptText(encrypted);
        setConfigs(JSON.parse(decrypted));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const persist = useCallback(async (next: ApiKeyConfig[]) => {
    const encrypted = await encryptText(JSON.stringify(next));
    localStorage.setItem(STORAGE_KEY, encrypted);
    setConfigs(next);
  }, []);

  const addConfig = useCallback(
    async (config: Omit<ApiKeyConfig, "id">) => {
      const next = [...configs, { ...config, id: generateId() }];
      await persist(next);
      return next[next.length - 1].id;
    },
    [configs, persist],
  );

  const updateConfig = useCallback(
    async (id: string, updates: Partial<Omit<ApiKeyConfig, "id">>) => {
      const next = configs.map((c) => {
        if (c.id !== id) return c;
        // If apiKey is empty string, keep the old one (don't overwrite)
        const apiKey =
          updates.apiKey === "" || updates.apiKey === undefined
            ? c.apiKey
            : updates.apiKey;
        return { ...c, ...updates, apiKey };
      });
      await persist(next);
    },
    [configs, persist],
  );

  const removeConfig = useCallback(
    async (id: string) => {
      const next = configs.filter((c) => c.id !== id);
      await persist(next);
    },
    [configs, persist],
  );

  const getConfig = useCallback(
    (id: string) => configs.find((c) => c.id === id),
    [configs],
  );

  return {
    configs,
    isLoading,
    addConfig,
    updateConfig,
    removeConfig,
    getConfig,
    hasConfigs: configs.length > 0,
  };
}

// Backward-compatible hook for places that only need the first (default) key
export function useApiKey() {
  const { configs, isLoading, addConfig, updateConfig, removeConfig } =
    useApiKeys();

  const storedKey = configs[0] ?? null;

  return {
    storedKey,
    isLoading,
    saveKey: addConfig,
    removeKey: removeConfig,
    hasKey: !!storedKey,
  };
}

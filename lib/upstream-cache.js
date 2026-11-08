'use strict';

/**
 * Utilitários para proxies de dados públicos (Impostômetro, Gastômetro):
 * erro com status HTTP e um cache em memória, por instância, que devolve o
 * último valor conhecido quando a fonte falha.
 */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function createUpstreamCache({ maxEntries = 300 } = {}) {
  const entries = new Map();

  const get = (key, { allowStale = false } = {}) => {
    const entry = entries.get(key);
    if (!entry) return null;
    if (!allowStale && entry.expiresAt <= Date.now()) return null;
    return entry.value;
  };

  const set = (key, value, ttlMs) => {
    entries.delete(key);
    if (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
    entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  };

  /**
   * Carrega `key` com `loader` respeitando o TTL. Se a fonte falhar com erro de
   * servidor e houver valor vencido, devolve-o marcado como `desatualizado`:
   * contadores projetados continuam úteis enquanto a fonte não se recupera.
   */
  const cached = async (key, ttlMs, loader) => {
    const fresh = get(key);
    if (fresh) return fresh;
    try {
      const value = await loader();
      set(key, value, ttlMs);
      return value;
    } catch (error) {
      const stale = get(key, { allowStale: true });
      const isClientError = error instanceof HttpError && error.status < 500;
      if (stale && !isClientError) {
        return Array.isArray(stale) ? stale : { ...stale, desatualizado: true };
      }
      throw error;
    }
  };

  return { cached, clear: () => entries.clear() };
}

module.exports = { HttpError, createUpstreamCache };

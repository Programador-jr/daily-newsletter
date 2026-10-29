/**
 * Read a Fetch API response without buffering more than maxBytes in memory.
 * A Content-Length check is only an early rejection; streaming enforcement is
 * still required for chunked responses and incorrect/missing headers.
 */
module.exports = async function readResponseLimited(response, maxBytes, errorMessage) {
  if (!response || !Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError('A response and a non-negative integer byte limit are required.');
  }

  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(errorMessage);
  }

  const body = response.body;
  if (!body || typeof body.getReader !== 'function') {
    if (typeof response.arrayBuffer === 'function') {
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > maxBytes) throw new Error(errorMessage);
      return buffer;
    }
    if (typeof response.text === 'function') {
      const buffer = Buffer.from(await response.text());
      if (buffer.length > maxBytes) throw new Error(errorMessage);
      return buffer;
    }
    throw new TypeError('The response does not expose a readable body.');
  }

  const reader = body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = Buffer.from(value);
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // Preserve the size-limit error if the stream cannot be cancelled.
        }
        throw new Error(errorMessage);
      }
      chunks.push(chunk);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Some custom/test readers do not implement releaseLock.
    }
  }

  return Buffer.concat(chunks, totalBytes);
};

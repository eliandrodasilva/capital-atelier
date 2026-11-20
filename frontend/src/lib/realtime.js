const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

function getAuthToken() {
  const token = localStorage.getItem('app-token');
  if (token) return token;
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario?.token || null;
  } catch {
    return null;
  }
}

function parseSseBlock(block) {
  let eventName = 'message';
  const dataLines = [];

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;
  const raw = dataLines.join('\n');
  try {
    return { eventName, data: JSON.parse(raw) };
  } catch {
    return { eventName, data: raw };
  }
}

export function subscribeWalletEvents(
  walletId,
  { onConnected, onEvent, onDisconnect } = {}
) {
  let closed = false;
  let controller = null;
  let reconnectTimer = null;

  const connect = async () => {
    if (closed || !walletId) return;

    const token = getAuthToken();
    if (!token) return;

    controller = new AbortController();

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/wallets/${walletId}/events`,
        {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`SSE status ${response.status}`);
      }

      onConnected?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!closed) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, '\n');

        let splitIndex;
        while ((splitIndex = buffer.indexOf('\n\n')) !== -1) {
          const block = buffer.slice(0, splitIndex);
          buffer = buffer.slice(splitIndex + 2);

          const parsed = parseSseBlock(block);
          if (parsed && parsed.eventName !== 'CONNECTED') {
            onEvent?.(parsed.data);
          }
        }
      }
    } catch {
      // Connection closed or failed; handled below
    }

    if (!closed) {
      onDisconnect?.();
      reconnectTimer = setTimeout(connect, 4000);
    }
  };

  connect();

  return () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (controller) controller.abort();
  };
}

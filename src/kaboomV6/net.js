function netInit(url) {
  const handlers = {};
  const sendQueue = [];

  let socket = null;

  function connected() {
    return socket !== null && socket.readyState === 1;
  }

  function connect() {
    const ws = new WebSocket(url);

    return (
      new Promise() <
      WebSocket >
      ((resolve, reject) => {
        ws.onopen = () => {
          resolve(ws);
          socket = ws;
          for (const msg of sendQueue) {
            ws.send(msg);
          }
        };

        ws.onerror = () => {
          reject(`failed to connect to ${url}`);
        };

        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (handlers[msg.type]) {
            for (const handler of handlers[msg.type]) {
              handler(msg.id, msg.data);
            }
          }
        };
      })
    );
  }

  function recv(type, handler) {
    if (!handlers[type]) {
      handlers[type] = [];
    }
    handlers[type].push(handler);
  }

  function send(type, data) {
    const msg = JSON.stringify({
      type: type,
      data: data,
    });
    if (socket) {
      socket.send(msg);
    } else {
      sendQueue.push(msg);
    }
  }

  function close() {
    if (socket) {
      socket.close();
    }
  }

  return {
    connect,
    close,
    connected,
    recv,
    send,
  };
}

export { netInit };

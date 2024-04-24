import { useCallback, useEffect, useRef, useState } from 'react';

export default function usePeerStateSync(
  initialState,
  peer,
  onConnection,
  isHost
) {
  const [state, setState] = useState(initialState);

  // ! Ref hack to use latest value of isHost
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  function handleSync(data) {
    console.log('isHost: ', isHostRef.current);
    if (isHostRef.current) {
      sync(data);
    }
  }

  const registerConnection = useCallback(
    function (connection) {
      connection.on('data', (data) => {
        if (data.type == 'state') {
          console.log('recieved update');
          setState(data.data);
          // * send the state updates to all the nodes
          handleSync(data.data);
        }
      });
    },
    [peer]
  );

  useEffect(() => {
    peer.on('connection', (conn) => {
      conn.on('error', console.log);

      conn.on('open', () => {
        console.log('Connection Established');
        onConnection(peer.connections);
        registerConnection(conn);
      });
    });

    return () => {
      peer.removeAllListeners();
    };
  }, [peer]);

  function sync(data) {
    console.log(peer.connections);
    Object.values(peer.connections).forEach((connArr) => {
      connArr[0].send({ type: 'state', data: data });
    });
  }

  function _setState(data) {
    setState(data);
    sync(data);
  }

  return [state, _setState, registerConnection];
}

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import usePeerStateSync from "./hooks/usePeerStateSync";
import LocalGame from "./GameBoard";
import logic from "./game.js";
import "./App.css";
import { PeerContext } from "./context.js";
import { BASE_IDENTIFIER } from "./constants.js";
import Toast from "./utils/toast";

function App() {
  const peer = useContext(PeerContext);
  const [connectToId, setConnectToId] = useState("");
  const [peerId, setPeerId] = useState();
  const [isHost, setIsHost] = useState(false);
  // const [isStarted, setIsStarted] = useState(false)
  const [connections, setConnections] = useState([]);

  const options = useMemo(
    () => ({ players: 2 || Object.keys(connections).length + 1 }),
    [connections]
  );
  const board = useMemo(() => new logic(options), [options]);
  const initGameState = {
    game: board.game,
    players: board.players,
    turn: board.turn,
    lastPos: null,
    isStarted: false,
  };

  const [sharedState, setSharedState, registerConnection] = usePeerStateSync(
    initGameState,
    peer,
    onConnection,
    isHost
  );

  const [turnNo, setTurnNo] = useState(0);

  // * sync the entire internal board logic
  useEffect(() => {
    console.log("updating internal board");
    board.game = sharedState.game;
    board.players = sharedState.players;
    board.turn = sharedState.turn;
  }, [sharedState]);

  function onConnection() {
    setConnections(peer.connections);
  }

  useEffect(() => {
    peer.on("error", alert);

    peer.on("open", function (id) {
      console.log("My peer ID is: " + id);
      setPeerId(id);
    });

    return () => {
      // peer.removeAllListeners();
    };
  }, []);

  function handleConnect() {
    let fullId = BASE_IDENTIFIER + connectToId;

    let connection = peer.connect(fullId);

    connection.on("open", () => {
      connection.on("error", console.log);

      console.log("Connection established");

      setTurnNo(Object.keys(peer.connections).length);

      onConnection(connection);
      registerConnection(connection);
    });
  }

  useEffect(() => {
    console.log("sharedState: ", sharedState);
  }, [sharedState]);

  const toastRef = useRef();
  function onError(error) {
    console.log(error);
    toastRef.current.raise();
  }

  return (
    <>
      <Toast ref={toastRef}>It&apos;s Not your Turn</Toast>
      <div className="flex flex-col text-white gap-4 p-4">
        <div>My peer id: {peerId?.replace(BASE_IDENTIFIER, "")}</div>
        <div className="flex gap-4">
          <div>Is Host: </div>
          <input
            type="checkbox"
            value={isHost}
            onChange={(e) => setIsHost(e.target.checked)}
          />
        </div>
        {!isHost && (
          <div className="flex gap-4 items-center">
            <div>Connect To:</div>
            <input
              className="text-black p-2"
              type="text"
              value={connectToId}
              onChange={(e) => setConnectToId(e.target.value)}
            />
            <button className="bg-blue-500 p-2" onClick={handleConnect}>
              Connect
            </button>
          </div>
        )}
        <div>Connected To: {Object.keys(connections)}</div>
        {Object.keys(connections).length > 0 && !sharedState.isStarted && (
          <button
            className="bg-blue-500"
            onClick={() => setSharedState({ ...sharedState, isStarted: true })}
          >
            Start Game
          </button>
        )}

        <button
          className="bg-red-500 "
          onClick={() => setSharedState({ ...sharedState })}
        >
          Force Sync
        </button>

        {sharedState.isStarted && (
          <LocalGame
            turn={turnNo}
            board={board}
            game={sharedState}
            setGame={setSharedState}
            options={options}
            onError={onError}
          />
        )}
      </div>
    </>
  );
}

export default App;

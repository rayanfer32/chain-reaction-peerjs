import "./App.css";
import { useContext, useEffect, useMemo, useState } from "react";
import usePeerStateSync from "./hooks/usePeerStateSync";
import { PeerContext } from "./main";
import LocalGame from "./GameBoard";
import logic from "./game.js";

function App() {
  const peer = useContext(PeerContext);
  const [connectToId, setConnectToId] = useState("");
  const [peerId, setPeerId] = useState();
  const [isHost, setIsHost] = useState(false);
  // const [isStarted, setIsStarted] = useState(false)
  const [connections, setConnections] = useState([]);

  const options = useMemo(
    () => ({ players: Object.keys(connections).length + 1 }),
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

  // * sync the internal board logic
  useEffect(() => {
    if (sharedState.lastPos) {
      board.add(sharedState.lastPos);
    }
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
    let connection = peer.connect(connectToId);

    connection.on("open", () => {
      connection.on("error", console.log);

      console.log("Connection established");
      onConnection(connection);
      registerConnection(connection);
    });
  }

  useEffect(() => {
    console.log("sharedState: ", sharedState);
  }, [sharedState]);

  return (
    <div className="flex flex-col text-white gap-4 p-4">
      <div>My peer id: {peerId}</div>
      <div className="flex gap-4">
        <div>Is Host: </div>
        <input
          type="checkbox"
          value={isHost}
          onChange={(e) => setIsHost(e.target.checked)}
        />
      </div>
      <div className="flex gap-4">
        <div>Connect To:</div>
        <input
          className="text-black"
          type="text"
          value={connectToId}
          onChange={(e) => setConnectToId(e.target.value)}
        />
        <button className="bg-blue-500" onClick={handleConnect}>
          Connect
        </button>
      </div>
      <div>Connected To: {Object.keys(connections)}</div>
      {Object.keys(connections).length > 0 && (
        <button
          className="bg-blue-500"
          onClick={() => setSharedState({ ...initGameState, isStarted: true })}
        >
          Start Game
        </button>
      )}
      <textarea
        className="hidden text-gray-800"
        value={JSON.stringify(sharedState)}
        onChange={(e) => setSharedState(e.target.value)}
        name=""
        id=""
        cols="30"
        rows="2"
      ></textarea>

      {sharedState.isStarted && (
        <LocalGame
          board={board}
          game={sharedState}
          setGame={setSharedState}
          options={options}
        />
      )}
    </div>
  );
}

export default App;

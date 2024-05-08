import { useContext, useEffect, useMemo, useRef, useState } from "react";
import usePeerStateSync from "./hooks/usePeerStateSync";
import LocalGame from "./GameBoard";
import logic from "./game.js";
import "./App.css";
import { PeerContext } from "./context.js";
import { BASE_IDENTIFIER } from "./constants.js";
import Toast from "./utils/toast";
import Button from "./components/Button.jsx";

const DEBUG = false;

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
    peerIds: [], // todo: host should push the connected peers to this for tracking turn
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
    peer.on("error", (err) => alert(err.message));

    peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      setPeerId(id);
    });

    return () => {
      // peer.removeAllListeners();
    };
  }, []);

  function handleConnect() {
    let fullId = BASE_IDENTIFIER + connectToId;
    _handleConnect(fullId);
  }

  function _handleConnect(fullId) {
    let connection = peer.connect(fullId);
    console.log("Connecting to " + fullId);

    connection.on("error", console.log);

    connection.on("open", () => {
      console.log("Connection established");

      setSharedState({
        ...sharedState,
        peerIds: [...sharedState.peerIds, peerId],
      });
      // ! turn number should be based on the number of connections of the host
      setTurnNo(Object.keys(peer.connections).length);

      onConnection(connection);
      registerConnection(connection);
    });
  }

  useEffect(() => {
    console.log("sharedState: ", sharedState);
  }, [sharedState]);

  // * join the game if hostId is found in the url
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get("hostId");
    if (hostId) {
      console.log("hostId: ", hostId);
      setConnectToId(hostId);

      // ! effect will be triggered when peer is ready and connectToId has value
      // let fullId = BASE_IDENTIFIER + hostId;
      // _handleConnect(fullId);
    }
  }, []);

  // * connect to the host if peer is ready
  useEffect(() => {
    if (connectToId) {
      handleConnect();
    }
  }, [peerId]);

  const toastRef = useRef();
  function onError(error) {
    console.log(error);
    toastRef.current.raise();
  }

  const textareaRef = useRef();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = JSON.stringify(sharedState, null, 2);
    }
  }, [sharedState]);

  const isWaiting =
    !isHost && !sharedState.isStarted && Object.keys(connections).length > 0;

  return (
    <>
      <Toast ref={toastRef}>It&apos;s Not your Turn</Toast>
      <div className="flex flex-col text-white gap-4 p-4">
        <div>My peer id: {peerId?.replace(BASE_IDENTIFIER, "")}</div>

        {(isHost || Object.keys(connections).length < 1) && (
          <>
            {DEBUG && (
              <>
                <Button
                  onClick={() => {
                    console.log(initGameState);
                    console.log("connections: ", connections);
                  }}
                >
                  Debug
                </Button>

                <textarea
                  className="bg-zinc-900 text-gray-200 font-mono"
                  rows={10}
                  ref={textareaRef}
                ></textarea>
                <Button
                  onClick={() => {
                    setSharedState(JSON.parse(textareaRef.current.value));
                  }}
                >
                  Update Shared State
                </Button>
              </>
            )}

            <label className="inline-flex items-center cursor-pointer">
              <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Join Room
              </span>
              <input
                type="checkbox"
                className="sr-only peer"
                value={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
              />
              <div className="shadow-sm shadow-blue-500 relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-2 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Create Room
              </span>
            </label>

            {!isHost && (
              <div className="flex gap-4 items-center">
                <div>Connect To:</div>
                <input
                  className="text-black p-2"
                  type="text"
                  value={connectToId}
                  onChange={(e) => setConnectToId(e.target.value)}
                />
                <Button onClick={handleConnect}>Connect</Button>
              </div>
            )}
            {isHost && (
              <a
                className="bg-blue-500 p-2 w-fit"
                href={
                  window.location.href +
                  "?hostId=" +
                  peerId?.replace(BASE_IDENTIFIER, "")
                }
              >
                <div className="flex gap-2">
                  <div>Invite Link</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-share-2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                  </svg>
                </div>
              </a>
            )}

            {isHost &&
              Object.keys(connections).length > 0 &&
              !sharedState.isStarted && (
                <Button
                  onClick={() =>
                    setSharedState({ ...initGameState, isStarted: true })
                  }
                >
                  Start Game
                </Button>
              )}
          </>
        )}

        <>
          <div>
            Connected To:{" "}
            {Object.keys(connections).map((id) => (
              <code className="p-2 bg-zinc-800 rounded-md mx-2" key={id}>
                {id}
              </code>
            ))}
          </div>
          {isWaiting && (
            <div className="flex gap-4 justify-center">
              <div className="w-5 h-5 bg-green-500 rounded animate-spin"></div>
              <p>Waiting for host to start the game...</p>
            </div>
          )}
        </>

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

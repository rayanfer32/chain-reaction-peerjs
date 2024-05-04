import { useCallback, useMemo, useState } from "react";
import logic from "./game.js";

function Atoms({ mass, color }) {
  switch (mass) {
    case 1:
      return (
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 bg-${color}-600 border rounded-full`}></div>
        </div>
      );
    case 2:
      return (
        <div className="animate-spin">
          <div className="flex flex-col items-center ">
            <div
              className={`w-3 h-3 bg-${color}-600 border rounded-full`}
            ></div>
            <div
              className={`w-3 h-3 bg-${color}-600 border rounded-full`}
            ></div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="scale-75 animate-spin">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 bg-${color}-600 border rounded-full`}
            ></div>
            <div className="flex items-center justify-around">
              <div
                className={`w-3 h-3 bg-${color}-600 border rounded-full`}
              ></div>
              <div
                className={`w-3 h-3  bg-${color}-600 border rounded-full`}
              ></div>
            </div>
          </div>
        </div>
      );
  }

  return <div className="animate-spin"></div>;
}

const LocalGame = ({ turn, options, board, game, setGame, onError }) => {
  // const board = useMemo(() => new logic(options), [options]);
  // const [game, setGame] = useState({
  //   game: board.game,
  //   players: board.players,
  //   turn: board.turn,
  // });

  const add = useCallback(
    (i, j) => {
      // * prevent adding atoms when not your turn
      if (turn != board.turn) {
        // alert("it's not your turn");
        onError("It's not your turn");
        return;
      }

      // var pos = JSON.parse(event.target.id);
      var pos = [i, j];
      console.log("pos@", pos);
      board.add(pos);

      // todo: prevent caling setGame if player clicks on other players atoms
      setGame({
        ...game,
        game: board.game,
        players: board.players,
        turn: board.turn,
        lastPos: pos,
      });
    },
    [game]
  );

  // todo: when the grid line is clicked 0,0 pos is sent, which should be prevented.
  const draw = () => {
    return (
      <>
        {game.game.map((x, i) => {
          return (
            <tr key={i}>
              {x.map((y, j) => {
                return (
                  <td
                    id={`[${i},${j}]`}
                    key={j}
                    // onClick={add.bind(this)}
                    onClick={() => add(i, j)}
                    className={`w-16 h-16 border-4 border-${
                      game.players[game.turn]
                    }-600 text-${game.game[i][j].player}-600 transition-all`}
                  >
                    <Atoms color={game.game[i][j].player} mass={y.mass} />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </>
    );
  };

  let isTurn = turn == game.turn;
  let shadowColor = "shadow-" + game.players[game.turn] + "-600";
  let bgColor = "bg-" + game.players[game.turn] + "-800";
  let activeTurnColor =
    isTurn && `${bgColor} bg-opacity-20 ${shadowColor} shadow-lg animate-pulse`;

  return (
    <>
      {game.players.length > 1 ? (
        <div className="flex h-full">
          <table
            className={`m-auto border-${
              game.players[game.turn]
            }-600 ${activeTurnColor} text-gray-300 text-3xl`}
          >
            <tbody>{draw()}</tbody>
          </table>
        </div>
      ) : (
        <div
          className={`border-${game.players[0]}-600 border-4 rounded-sm w-screen md:w-auto h-full md:h-auto flex flex-col justify-center p-8 bg-black bg-opacity-50`}
        >
          <h1 className="text-5xl p-8 flex justify-center text-green-600">
            GAME OVER
          </h1>
          <h1 className={`col-span-4 text-lg text-${game.players[0]}-600`}>
            {game.players[0].toUpperCase()} WON
          </h1>
          <button
            onClick={() => {
              let board = new logic({ players: 2 });
              setGame({
                game: board.game,
                players: board.players,
                turn: board.turn,
                isStarted: true,
              });
            }}
            className={`bg-green-600 bg-opacity-50 hover:bg-opacity-100 mt-16 py-2 rounded-sm`}
          >
            Re-match
          </button>
        </div>
      )}
    </>
  );
};

export default LocalGame;

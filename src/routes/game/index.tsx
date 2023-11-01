import { createSignal } from "solid-js";
import { Title } from "solid-start";

import { useSocketContext } from "~/contexts/useSocketContext";
import Board from "~/components/Board";
import Button from "~/components/Button";

const playerMap = {
   0: " ",
   1: "✕",
   2: "◯"
}

export default function Home() {
  const [boardState, setBoardState] = createSignal<number[][]>(new Array(15).fill(0).map(() => new Array(15).fill(0)));
  const { socket, msg, roomId, playerId, isRoomFull, isGameStarted, gameState } = useSocketContext();

  const updateBoard = async (x: number, y: number) => { 
   //  const newBoardState = [...boardState()];
    const move = { PlayerId: playerId(), Row: x, Col: y, TimeStamp: new Date() };
    console.log(move);
   //  try {
      await socket()?.send("Move", roomId(), move);
      // newBoardState[x][y] = playerId() === gameState.player1Id ? 1 : 2;
      // setBoardState(newBoardState);
   //  } catch (e) {

   //  }
  }

  const startGame = async() => {
    socket()?.send("StartGame", roomId());
  }

   const disconnect = async () => {
      await socket()?.send("LeaveGame", roomId());
   }

  return (
    <main>
      <Title>Game</Title>
      <h1>Gomoku</h1>
      
      <div class="my-4">
         <p>Your room id: {roomId()}</p>
         <p>message: {msg()}</p>
         {
            isGameStarted() ?
            (playerId() === gameState.currentPlayerId ?
            <p>Your turn</p>
            :
            <p>Opponent's turn</p>)

            :

            (isRoomFull() ?
            (playerId() === roomId() ?
            <Button onClick={startGame}>Start</Button>
            :
            <p>Waiting for the host to start the game</p>)
            :
            <p>Waiting for opponent</p>)
         }
      </div>
      
      <div id="GameDiv" class="m-8">
         <Board updateBoard={updateBoard} boardState={boardState()} playerMap={playerMap} isYourTurn={playerId() === gameState.currentPlayerId} />
      </div>

      <Button onClick={disconnect}>
         Leave
      </Button>
    </main>
  );
}

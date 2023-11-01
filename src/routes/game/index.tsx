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
  const { socket, msg, roomId, playerId, gameState } = useSocketContext();

  const updateBoard = (x: number, y: number) => { 
    const newBoardState = [...boardState()];
    try {
      socket()?.send("Move", roomId(), { Row: x, Col: y})
      newBoardState[x][y] = playerId() === gameState.player1Id ? 1 : 2;
      setBoardState(newBoardState);
    } catch (e) {

    }
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
            playerId() === gameState.currentPlayerId ?
            <p>Your turn</p>
            :
            <p>Opponent's turn</p>
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

import { Title } from "solid-start";
import { useSocketContext } from "~/contexts/useSocketContext";
import { useNavigate } from "solid-start";
import Board from "~/components/Board";
import Button from "~/components/Button";

import { playerMap } from "~/utils/constants";
import { createEffect } from "solid-js";

export default function Home() {
   const navigate = useNavigate();

  const { socket, msg, roomId, playerId, isConnected, isRoomFull, isGameStarted, gameState } = useSocketContext();

  const updateBoard = async (x: number, y: number) => { 
    const move = { PlayerId: playerId(), Row: x, Col: y, TimeStamp: new Date() };
   await socket()?.send("Move", roomId(), move);
  }

  const startGame = async() => {
    socket()?.send("StartGame", roomId());
  }

  const leaveServer = async () => {
      await socket()?.send("LeaveGame", roomId());
  }

   const disconnect = () => {
      leaveServer().catch(e => console.log(e.message));
      // navigate("/home");
   }

   const copyRoomId = () => {
      navigator.clipboard.writeText(roomId());
   }

   createEffect(() => {
      if(!isConnected()) {
         navigate("/home");
      } 
   });

  return (
    <main>
      <Title>Game</Title>
      <h1>Gomoku</h1>
      
      <div class="my-4">
         <p onClick={copyRoomId} class="cursor-pointer hover:text-blue-500 transition-colors">Room Id: {roomId()}</p>
         <p>{msg()}</p>
         {
            isRoomFull() && !isGameStarted() && playerId() === roomId() &&
            <Button onClick={startGame}>
               Start Game
            </Button>
         }
      </div>
      
      <div id="GameDiv" class="m-8">
         <Board 
         updateBoard={updateBoard} 
         boardState={gameState.board} 
         playerMap={playerMap} 
         isClickable={isGameStarted() && playerId() === gameState.currentPlayerId} 
         />
      </div>

      <Button onClick={disconnect}>
         Leave
      </Button>
    </main>
  );
}

import { createSignal } from "solid-js";
import { Title } from "solid-start";

import useJoin from "~/hooks/useJoin";
import Board from "~/components/Board";

const playerMap = {
   0: " ",
   1: "✕",
   2: "◯"
}

export default function Home() {
  const [boardState, setBoardState] = createSignal<number[][]>(new Array(15).fill(0).map(() => new Array(15).fill(0)));
  const [currPlayer, setCurrPlayer] = createSignal<number>(1); // 1: "●", 2: "○"
  const { socket, msg } = useJoin();

  const updateBoard = (x: number, y: number) => { 
    const newBoardState = [...boardState()];
    newBoardState[x][y] = currPlayer();
    setBoardState(newBoardState);
    setCurrPlayer(currPlayer() === 1 ? 2 : 1);
  }

  const handleReset = () => {
    setBoardState(new Array(15).fill(0).map(() => new Array(15).fill(0)));
    setCurrPlayer(1);
  }

  const sendMessage = () => {
    socket()?.send("messageReceived", "Hi");
    console.log("message sent");
  }

  return (
    <main>
      <Title>Home</Title>
      <h1 class="cursor-pointer hover:drop-shadow transition" onClick={handleReset}>Gomoku</h1>

      <button 
      class="px-4 py-2 border rounded-md hover:bg-slate-400 hover:text-white transition"
      onClick={sendMessage}
      >
        Connect
      </button>
      <p>Connection: {msg()}</p>
      {/* <div class="my-4">
        <h2>{playerMap[currPlayer() as 0 | 1 | 2]}</h2>
      </div>
      
      <div id="GameDiv" class="m-8">
          <Board updateBoard={updateBoard} boardState={boardState()} playerMap={playerMap} />
      </div> */}
    </main>
  );
}

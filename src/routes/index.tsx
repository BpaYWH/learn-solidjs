import { createSignal } from "solid-js";
import { Title } from "solid-start";
import Board from "~/components/Board";

export default function Home() {
  const [isStart, setIsStart] = createSignal(true);
  const [boardState, setBoardState] = createSignal(new Array(15).fill(0).map(() => new Array(15).fill(0)));
  const [currPlayer, setCurrPlayer] = createSignal(1); // 1: "●", 2: "○"

  const updateBoard = (x: number, y: number) => { 
    boardState()[x][y] = currPlayer();
    setBoardState(boardState());
    setCurrPlayer(currPlayer() === 1 ? 2 : 1);
  }

  return (
    <main>
      <Title>Home</Title>
      <h1>Gomoku</h1>

      <div class="my-4">
        <button class="px-4 py-2 rounded-lg border" onClick={() => setIsStart(!isStart())}>
          {
            isStart() ? "Stop" : "Start"
          }
        </button>
      </div>
      
      <div id="GameDiv" class="m-8">
        {
          isStart() &&
          <Board updateBoard={updateBoard} boardState={boardState()} />
        }
      </div>
    </main>
  );
}

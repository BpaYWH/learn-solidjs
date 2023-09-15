import { For } from "solid-js";
interface Props {
   boardState?: Array<Array<number>> // 0: " ", 1: "●", 2: "○"
   updateBoard: (x: number, y: number) => void
};

const baseBoard: Array<Array<number>> = new Array(15).fill(0).map(() => new Array(15).fill(0));

const stateMap = {
   0: " ",
   1: "●",
   2: "◯"
}

export default function Board(props: Props) {
   const handleGridClick = (x: number, y: number) => {
      props.updateBoard(x, y);
   }

   return (
      <div>
         <For each={baseBoard}>
            {
               (row, rowIndex) => (
                  <div class="flex justify-evenly">
                     <For each={row}>
                        {
                           (col, colIndex) => (
                                 <div class="flex justify-center items-center border w-full aspect-square hover:bg-slate-200" onClick={() => handleGridClick(rowIndex(), colIndex())}>
                                    {stateMap[props.boardState?.[rowIndex()]?.[colIndex()] as 0 | 1 | 2]}
                                 </div>
                              )
                           }
                     </For>
                  </div>
               )
            }
          </For> 
      </div>
   );
};
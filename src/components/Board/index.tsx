import { For } from "solid-js";
interface Props {
   boardState: number[][] // 0: " ", 1: "●", 2: "○"
   updateBoard: (x: number, y: number) => void
   playerMap: {
      0: string,
      1: string,
      2: string
   }
};

const baseBoard: Array<Array<number>> = new Array(15).fill(0).map(() => new Array(15).fill(0));

export default function Board(props: Props) {
   const handleGridClick = (x: number, y: number) => {
      if (props.boardState?.[x]?.[y] === 0) {
         props.updateBoard(x, y);
      }
   }

   return (
      <div class="w-fit bg-orange-50 mx-auto">
         <For each={baseBoard}>
            {
               (row, rowIndex) => (
                  <div class="flex justify-center">
                     <For each={row}>
                        {
                           (_, colIndex) => (
                                 <button class={`flex justify-center items-center border w-[40px] aspect-square hover:bg-slate-200 hover:bg-opacity-50 ${props.boardState?.[rowIndex()]?.[colIndex()] !== 0 && "cursor-not-allowed"}`} onClick={() => handleGridClick(rowIndex(), colIndex())}>
                                    {props.playerMap[props.boardState?.[rowIndex()]?.[colIndex()] as 0 | 1 | 2]}
                                 </button>
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
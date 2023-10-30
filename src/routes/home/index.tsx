import { createSignal, createEffect } from "solid-js";
import { Title, useNavigate } from "solid-start";

import { useSocketContext } from "~/contexts/useSocketContext";

import Button from "~/components/Button";

export default function Home() {
  const { socket, msg, roomId } = useSocketContext();
  const [joinRoomId, setJoinRoomId] = createSignal<string>("");
  const navigate = useNavigate();

  const createRoom = async () => {
    await socket()?.start();
    await socket()?.send("CreateGame");
  }

  const joinRoom = async () => {
   await socket()?.start();
   await socket()?.send("JoinGame", joinRoomId());
   setJoinRoomId("");
  }

  const disconnect = async () => {
   await socket()?.stop();
  }

  createEffect(() => {
    if (roomId().length !== 0)
      navigate(`/game?id=${roomId()}`);
  });

  return (
    <main>
      <Title>Home</Title>
      <h1 class="cursor-pointer hover:drop-shadow transition">Gomoku</h1>

      <div class="flex flex-col gap-4 w-fit mx-auto">
        <Button onClick={createRoom}>
          Create Room
        </Button>
        <p>Debug message: {msg()}</p>

         <input 
         type="text" 
         name="gameRoomId"
         placeholder="Room ID"
         class="px-4 py-2 border rounded-md" 
         value={joinRoomId()}
         onChange={e => { setJoinRoomId(e.target.value) }}
         />

         <Button onClick={joinRoom}>
            Join Room
         </Button>

        <Button onClick={disconnect}>
         Stop Connection
        </Button>
      </div>
    </main>
  );
}

import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import * as signalR from "@microsoft/signalr";

interface GameMove {
   id: string;
   gameId: string;
   playerId: string;
   row: number;
   col: number;
   timestamp: Date;
}

interface GameState {
   gameId: string;
   player1Id: string;
   player2Id: string;
   currentPlayerId: string;
   isFinished: boolean;
   moves: GameMove[];
   board: Array<Array<number>>;
}

export default function useSocket() {
   const [socket, setSocket] = createSignal<signalR.HubConnection>();
   const [msg, setMsg] = createSignal<string>("");
   const [roomId, setRoomId] = createSignal<string>("");
   const [gameState, setGameState] = createStore<GameState>({
      gameId: "",
      player1Id: "",
      player2Id: "",
      currentPlayerId: "",
      isFinished: false,
      moves: [],
      board: []
   });

   onMount(() => {
      const ws = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.2.16:5095/gameHub", {
         skipNegotiation: true,
         transport: signalR.HttpTransportType.WebSockets
      })
      .build();
      setSocket(ws);
      
      ws.on("RoomCreated", (roomId: string) => {
         setRoomId(roomId);
         setMsg("Created room with id: " + roomId);
      });
      ws.on("RoomNotCreated", () => {
         setMsg("Failed to create room");
      });

      ws.on("RoomJoined", (roomId: string) => {
         setRoomId(roomId);
         setMsg("Joined room");
      });
      ws.on("RoomNotFound", () => {
         setMsg("Failed to join room");
      });

      ws.on("PlayerConnected", (playerId: string) => {
         setMsg("Player" + playerId + "connected");
      });

      ws.on("GameStarted", (gameState: GameState) => {
         setGameState(gameState);
      });
      ws.on("GameNotStarted", (message: string) => {
         setMsg(message);
      });
      
      ws.on("InvalidGame", (message: string) => {
         setMsg(message);
      });
      ws.on("InvalidMove", (message: string) => {
         setMsg(message);
      });

      ws.on("GameUpdated", (gameState: GameState) => {
         setGameState(gameState);
      });
   });

   onCleanup(() => {
      socket()?.stop();
   });

   return {
      socket,
      msg,
      roomId
   };
}
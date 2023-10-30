import type { Accessor } from "solid-js";
import { useNavigate } from "solid-start";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
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
   // board: number[][];
}

type SocketStore = {
    socket: Accessor<signalR.HubConnection | undefined>;
    msg: Accessor<string>;
    roomId: Accessor<string>;
    playerId: Accessor<string>;
    gameState: GameState;
};

const defaultGameState: GameState = {
   gameId: "",
   player1Id: "",
   player2Id: "",
   currentPlayerId: "",
   isFinished: false,
   moves: [],
   // board: new Array(15).fill(0).map(() => new Array(15).fill(0))
} 
const defaultStore: SocketStore = {
   socket: () => undefined,
   msg: () => "",
   roomId: () => "",
   playerId: () => "",
   gameState: defaultGameState
};
const SocketContext = createContext<SocketStore>(defaultStore);

export function SocketProvider(props: any) {
   const navigate = useNavigate();
   const [socket, setSocket] = createSignal<signalR.HubConnection>();
   const [msg, setMsg] = createSignal<string>("");
   const [roomId, setRoomId] = createSignal<string>("");
   const [playerId, setPlayerId] = createSignal<string>("");
   const [gameState, setGameState] = createStore<GameState>(defaultGameState);

   const webSocket = { socket, msg, roomId, playerId, gameState };

   onMount(() => {
      const ws = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.2.16:5095/gameHub", {
         skipNegotiation: true,
         transport: signalR.HttpTransportType.WebSockets
      })
      .build();
      setSocket(ws);
      
      ws.on("RoomCreated", (roomId: string) => { // +playerId
         setRoomId(roomId);
         setMsg("Created room with id: " + roomId);
      });
      ws.on("RoomNotCreated", () => {
         setMsg("Failed to create room");
      });

      ws.on("RoomJoined", (roomId: string) => { // +playerId
         setRoomId(roomId);
         setMsg("Joined room");
      });
      ws.on("RoomNotFound", () => {
         setMsg("Failed to join room");
      });

      ws.on("PlayerConnected", (playerId: string) => {
         setMsg("Player " + playerId + " joined");
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

      ws.on("RoomLeft", (playerId: string) => {
         setMsg(`Player ${playerId} left`);
      });

      ws.onclose(() => {
         navigate("/home");
      });
   });

   onCleanup(() => {
      socket()?.stop();
   });

   return (
      <SocketContext.Provider value={webSocket}>
         {props.children}
      </SocketContext.Provider>
   );
}

export function useSocketContext() {
   return useContext(SocketContext);
}
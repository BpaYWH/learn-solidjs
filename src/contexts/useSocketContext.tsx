import type { Accessor } from "solid-js";
import { useNavigate } from "solid-start";
import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import * as signalR from "@microsoft/signalr";

interface GameMove {
   Id: string;
   GameId: string;
   PlayerId: string;
   Row: number;
   Col: number;
   Timestamp: Date;
}

interface GameState {
   gameId: string;
   player1Id: string;
   player2Id: string;
   currentPlayerId: string;
   isFinished: boolean;
   moves: GameMove[];
   board: number[][];
}

interface  GameStateObj {
   CurrentPlayerId: string;
   GameId: string;
   IsFinished: boolean;
   Moves: [];
   Player1Id: string;
   Player2Id: string;
   WinnerId: string;
   Board: number[][];
}

type SocketStore = {
    socket: Accessor<signalR.HubConnection | undefined>;
    msg: Accessor<string>;
    roomId: Accessor<string>;
    playerId: Accessor<string>;
    isRoomFull: Accessor<boolean>;
    isGameStarted: Accessor<boolean>;
    gameState: GameState;
};

const defaultGameState: GameState = {
   gameId: "",
   player1Id: "",
   player2Id: "",
   currentPlayerId: "null",
   isFinished: false,
   moves: [],
   board: new Array(15).fill(0).map(() => new Array(15).fill(0))
} 
const defaultStore: SocketStore = {
   socket: () => undefined,
   msg: () => "",
   roomId: () => "",
   playerId: () => "",
   isRoomFull: () => false,
   isGameStarted: () => false,
   gameState: defaultGameState
};
const SocketContext = createContext<SocketStore>(defaultStore);

export function SocketProvider(props: any) {
   const navigate = useNavigate();
   const [socket, setSocket] = createSignal<signalR.HubConnection>();
   const [msg, setMsg] = createSignal<string>("");
   const [roomId, setRoomId] = createSignal<string>("");
   const [playerId, setPlayerId] = createSignal<string>("");
   const [isRoomFull, setIsRoomFull] = createSignal<boolean>(false);
   const [isGameStarted, setIsGameStarted] = createSignal<boolean>(false);
   const [gameState, setGameState] = createStore<GameState>(defaultGameState);

   const webSocket = { socket, msg, roomId, playerId, isRoomFull, isGameStarted, gameState };

   const gameStateMapper = (gameStateJsonString: string) => {
      const gameStateObj: GameStateObj = JSON.parse(gameStateJsonString);
      
      let newGameState = {...gameState};
      newGameState.gameId = gameStateObj.GameId;
      newGameState.player1Id = gameStateObj.Player1Id;
      newGameState.player2Id = gameStateObj.Player2Id;
      newGameState.currentPlayerId = gameStateObj.CurrentPlayerId;
      newGameState.isFinished = gameStateObj.IsFinished;
      newGameState.moves = gameStateObj.Moves;
      newGameState.board = gameStateObj.Board;

      setGameState(newGameState);
   }

   onMount(() => {
      const ws = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.2.16:5095/gameHub", {
         skipNegotiation: true,
         transport: signalR.HttpTransportType.WebSockets
      })
      .build();
      setSocket(ws);
      
      ws.on("RoomCreated", (roomId: string, playerId: string) => {
         setRoomId(roomId);
         setPlayerId(playerId);
         setMsg("Created room with id: " + roomId);
      });
      ws.on("RoomNotCreated", () => {
         setMsg("Failed to create room");
      });

      ws.on("RoomJoined", (roomId: string, playerId: string) => {
         setRoomId(roomId);
         setPlayerId(playerId);
         setMsg("Joined room");
      });
      ws.on("RoomNotFound", () => {
         setMsg("Failed to join room");
      });

      ws.on("PlayerConnected", (playerId: string, isRoomFull: boolean) => {
         setIsRoomFull(isRoomFull);
         setMsg("Player " + playerId + " joined");
      });

      ws.on("GameStarted", (gameStateJson: string) => {
         setIsGameStarted(true);
         gameStateMapper(gameStateJson);
         setMsg("Game started");
      });
      ws.on("GameNotStarted", (message: string) => {
         setIsRoomFull(false);
         setMsg(message);
      });
      
      ws.on("InvalidGame", (message: string) => {
         setMsg(message);
      });
      ws.on("InvalidMove", (message: string) => {
         setMsg(message);
      });

      ws.on("GameUpdated", (gameStateJson: string) => {
         console.log("game updated")
         gameStateMapper(gameStateJson);
      });

      ws.on("RoomLeft", (playerId: string) => {
         setIsRoomFull(false);
         setIsGameStarted(false);
         setGameState(defaultGameState);
         setRoomId("");
         setPlayerId("");
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
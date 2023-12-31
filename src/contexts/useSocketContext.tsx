import type { Accessor } from "solid-js";
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
   winnerId: string;
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
    isConnected: Accessor<boolean>;
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
   winnerId: "",
   board: new Array(15).fill(0).map(() => new Array(15).fill(0))
} 
const defaultStore: SocketStore = {
   socket: () => undefined,
   msg: () => "",
   roomId: () => "",
   playerId: () => "",
   isConnected: () => false,
   isRoomFull: () => false,
   isGameStarted: () => false,
   gameState: defaultGameState
};
const SocketContext = createContext<SocketStore>(defaultStore);

export function SocketProvider(props: any) {
   const [socket, setSocket] = createSignal<signalR.HubConnection>();
   const [msg, setMsg] = createSignal<string>("");
   const [roomId, setRoomId] = createSignal<string>("");
   const [playerId, setPlayerId] = createSignal<string>("");
   const [isConnected, setIsConnected] = createSignal<boolean>(false);
   const [isRoomFull, setIsRoomFull] = createSignal<boolean>(false);
   const [isGameStarted, setIsGameStarted] = createSignal<boolean>(false);
   const [gameState, setGameState] = createStore<GameState>(defaultGameState);

   const webSocket = { socket, msg, roomId, playerId, isConnected, isRoomFull, isGameStarted, gameState };

   const gameStateMapper = (gameStateJsonString: string) => {
      const gameStateObj: GameStateObj = JSON.parse(gameStateJsonString);
      
      let newGameState = {...gameState};
      newGameState.gameId = gameStateObj.GameId;
      newGameState.player1Id = gameStateObj.Player1Id;
      newGameState.player2Id = gameStateObj.Player2Id;
      newGameState.currentPlayerId = gameStateObj.CurrentPlayerId;
      newGameState.isFinished = gameStateObj.IsFinished;
      newGameState.moves = gameStateObj.Moves;
      newGameState.winnerId = gameStateObj.WinnerId;
      newGameState.board = gameStateObj.Board;

      setGameState(newGameState);
   }

   const resetRoomState = () => {
      setIsConnected(false);
      setIsRoomFull(false);
      setIsGameStarted(false);
      setGameState(defaultGameState);
      setRoomId("");
      setPlayerId("");
   }

   const resetGameState = () => {
      setGameState(defaultGameState);
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
         setIsConnected(true);
         setRoomId(roomId);
         setPlayerId(playerId);
         setMsg("");
      });

      ws.on("RoomJoined", (roomId: string, playerId: string) => {
         setIsConnected(true);
         setRoomId(roomId);
         setPlayerId(playerId);
      });

      ws.on("PlayerConnected", (isFull: boolean) => {
         setIsRoomFull(isFull);
      });
      ws.on("PlayerDisconnected", (isFull: boolean) => {
         setIsRoomFull(isFull);
      });

      ws.on("GameStarted", (gameStateJson: string) => {
         resetGameState();
         setIsGameStarted(true);
         gameStateMapper(gameStateJson);
         const message = gameState.currentPlayerId === playerId() ? "Your turn" : "Opponent's turn";
         setMsg(message);
      });
      ws.on("GameNotStarted", (message: string) => {
         setIsRoomFull(false);
         setMsg(message);
      });
      
      ws.on("GameUpdated", (gameStateJson: string) => {
         gameStateMapper(gameStateJson);
      });
      ws.on("GameSet", () => {
         setIsGameStarted(false);
         const message = gameState.winnerId === playerId() ? "You won" : "You lost";
         setMsg(message);
      });

      ws.on("RoomLeft", () => {
         resetRoomState();
      });

      ws.on("RoomClosed", () => {
         ws.stop();
      });

      ws.on("Announcement", (msg: string) => {
         setMsg(msg);
      });

      ws.onclose((err) => {
         resetRoomState();
         resetGameState();
         setMsg("Disconnected from server");
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